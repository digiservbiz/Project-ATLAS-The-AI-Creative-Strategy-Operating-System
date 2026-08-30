# ATLAS Intelligence Hub Integration

The Intelligence Hub is the bridge between the new intelligence contracts and orchestration. It validates that the business model and Strategic State belong to the same business, aggregates state-derived and signal-derived Next Best Actions, and can ingest learning back into the Strategic State. The Orchestrator adapter converts the highest-priority intelligence action into a bounded workflow decision instead of creating additional agents.

Flow:

`Intelligence Hub → Next Best Action → Orchestrator Adapter → bounded workflow`

Learning remains a feedback path:

`Experiment → Outcome → Learning → Strategic State → Intelligence Hub → Next Workflow`

This adapter deliberately does not replace the existing Orchestrator. It supplies intelligence-driven workflow selection to it.
