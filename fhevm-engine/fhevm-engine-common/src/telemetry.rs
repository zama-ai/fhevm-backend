use opentelemetry::{
    global::{BoxedSpan, BoxedTracer, ObjectSafeSpan},
    trace::{TraceContextExt, Tracer},
    KeyValue,
};
use opentelemetry_sdk::Resource;
use std::error::Error;

use crate::utils::compact_hex;

pub fn setup_otlp(
    service_name: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync + 'static>> {
    let otlp_exporter = opentelemetry_otlp::new_exporter().tonic();

    let trace_provider = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(otlp_exporter)
        .with_trace_config(opentelemetry_sdk::trace::Config::default().with_resource(
            Resource::new(vec![KeyValue::new(
                opentelemetry_semantic_conventions::resource::SERVICE_NAME.to_string(),
                service_name.to_string(),
            )]),
        ))
        .install_batch(opentelemetry_sdk::runtime::Tokio)?;

    opentelemetry::global::set_tracer_provider(trace_provider);
    Ok(())
}

pub struct OtelTracer {
    ctx: opentelemetry::Context,
    service_name: String,
    tracer: BoxedTracer,
}

impl OtelTracer {
    pub fn child_span(&self, name: &'static str) -> BoxedSpan {
        self.tracer.start_with_context(name, &self.ctx)
    }

    pub fn set_error(&self, e: impl Error) {
        self.ctx
            .span()
            .set_status(opentelemetry::trace::Status::Error {
                description: e.to_string().into(),
            });
    }
}

impl Clone for OtelTracer {
    fn clone(&self) -> Self {
        OtelTracer {
            ctx: self.ctx.clone(),
            service_name: self.service_name.clone(),
            tracer: opentelemetry::global::tracer(self.service_name.clone()),
        }
    }
}

#[derive(Debug, PartialEq)]
struct Handle(String);

pub fn otel_with_handle(
    service_name: String,
    func_name: &'static str,
    handle: Vec<u8>,
) -> OtelTracer {
    let tracer = opentelemetry::global::tracer(service_name.clone());
    let span = tracer.start(func_name);

    // Add a short hex of the handle to the context
    let otel_handle = compact_hex(&handle)
        .get(0..8)
        .unwrap_or_default()
        .to_owned();

    let ctx = opentelemetry::Context::current()
        .with_value(Handle(otel_handle))
        .with_span(span);

    OtelTracer {
        ctx,
        tracer,
        service_name,
    }
}

pub fn end_span(span: &mut BoxedSpan) {
    span.end();
}
