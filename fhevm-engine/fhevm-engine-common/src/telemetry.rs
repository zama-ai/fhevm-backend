use opentelemetry::{
    global::{BoxedSpan, BoxedTracer, ObjectSafeSpan},
    trace::{SpanBuilder, Status, TraceContextExt, Tracer},
    Context, KeyValue,
};
use opentelemetry_sdk::{trace::SdkTracerProvider, Resource};
use std::{sync::Arc, time::SystemTime};

use crate::utils::compact_hex;

pub fn setup_otlp(
    service_name: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync + 'static>> {
    let otlp_exporter = opentelemetry_otlp::SpanExporter::builder()
        .with_tonic()
        .build()?;

    let resource = Resource::builder_empty()
        .with_attributes(vec![KeyValue::new(
            opentelemetry_semantic_conventions::resource::SERVICE_NAME.to_string(),
            service_name.to_string(),
        )])
        .build();

    let trace_provider = SdkTracerProvider::builder()
        .with_resource(resource)
        .with_batch_exporter(otlp_exporter)
        .build();

    opentelemetry::global::set_tracer_provider(trace_provider);

    Ok(())
}

#[derive(Clone)]
pub struct OtelTracer {
    ctx: opentelemetry::Context,
    tracer: Arc<BoxedTracer>,
}

impl OtelTracer {
    pub fn child_span(&self, name: &'static str) -> BoxedSpan {
        self.tracer.start_with_context(name, &self.ctx)
    }

    /// Sets attribute to the root span
    pub fn set_attribute(&self, key: &str, value: String) {
        self.ctx
            .span()
            .set_attribute(KeyValue::new(key.to_owned(), value));
    }

    /// Consumes and ends the tracer with status Ok
    pub fn end(self) {
        self.ctx.span().set_status(Status::Ok);
        self.ctx.span().end();
    }
}

#[derive(Debug, PartialEq)]
struct Handle(Vec<u8>);

pub fn tracer_with_handle(span_name: &'static str, handle: Vec<u8>) -> OtelTracer {
    let tracer = opentelemetry::global::tracer(format!("tracer_{}", span_name));
    let root_span = tracer.start(span_name);

    if handle.is_empty() {
        let ctx = Context::default().with_span(root_span);
        OtelTracer {
            ctx,
            tracer: Arc::new(tracer),
        }
    } else {
        // Add a short hex of the handle to the context
        let ctx = Context::default()
            .with_span(root_span)
            .with_value(Handle(handle.clone()));

        let handle = compact_hex(&handle)
            .get(0..10)
            .unwrap_or_default()
            .to_owned();

        ctx.span().set_attribute(KeyValue::new("handle", handle));

        OtelTracer {
            ctx,
            tracer: Arc::new(tracer),
        }
    }
}

/// Create a new span with start and end time
pub fn tracer_with_start_time(span_name: &'static str, start_time: SystemTime) -> OtelTracer {
    let tracer = opentelemetry::global::tracer(span_name);
    let root_span = tracer.build(SpanBuilder::from_name(span_name).with_start_time(start_time));
    let ctx = opentelemetry::Context::default().with_span(root_span);
    OtelTracer {
        ctx,
        tracer: Arc::new(tracer),
    }
}

pub fn tracer(span_name: &'static str) -> OtelTracer {
    tracer_with_handle(span_name, vec![])
}

pub fn attribute(span: &mut BoxedSpan, key: &str, value: String) {
    span.set_attribute(KeyValue::new(key.to_owned(), value));
}

/// Ends span with status Ok
pub fn end_span(mut span: BoxedSpan) {
    span.set_status(Status::Ok);
    span.end();
}

pub fn end_span_with_timestamp(mut span: BoxedSpan, timestamp: SystemTime) {
    span.set_status(Status::Ok);
    span.end_with_timestamp(timestamp);
}

/// Ends span with status Error with description
pub fn end_span_with_err(mut span: BoxedSpan, desc: String) {
    span.set_status(Status::Error {
        description: desc.into(),
    });
    span.end();
}
