package fhevm

// OrderedHashSet represents a set that maintains insertion order.
type OrderedHashSet[T comparable] struct {
	items map[T]struct{}
	order []T
}

// NewOrderedHashSet creates a new OrderedHashSet.
func NewOrderedHashSet[T comparable]() *OrderedHashSet[T] {
	return &OrderedHashSet[T]{
		items: make(map[T]struct{}),
		order: []T{},
	}
}

// Add inserts an item into the set, maintaining insertion order.
func (s *OrderedHashSet[T]) Add(item T) bool {
	if _, exists := s.items[item]; !exists {
		s.items[item] = struct{}{}
		s.order = append(s.order, item)
		return true
	}

	return false
}

// Contains checks if the item exists in the set.
func (s *OrderedHashSet[T]) Contains(item T) bool {
	_, exists := s.items[item]
	return exists
}

// Clear removes all elements from the set.
func (s *OrderedHashSet[T]) Clear() {
	s.items = make(map[T]struct{})
	s.order = []T{}
}

// ToSlice converts the set to a slice of its elements in insertion order.
func (s *OrderedHashSet[T]) ToSlice() []T {
	return append([]T{}, s.order...)
}

// Size returns the number of elements in the set.
func (s *OrderedHashSet[T]) Size() int {
	return len(s.items)
}
