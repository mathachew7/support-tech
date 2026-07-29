# lib/services

Cross-domain logic that does not belong to a single feature domain.
Example (Phase 3): booking completion -> decrement subscription hours.

Domains talk to each other through functions here, not by importing each other's internals.
