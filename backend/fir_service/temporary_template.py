"""Prototype extraction fields, mapping, and document format.

Replace this module when the reference Indian FIR PDF is supplied. The API and
transcription pipeline depend only on extract() and format_draft().
"""

import re

FIELDS = (
    "incident_type", "incident_date", "incident_time", "incident_location",
    "complainant_description", "incident_description", "suspect_description",
    "property_involved", "vehicle_details", "witness_details",
    "evidence_mentioned", "additional_information",
)


def extraction_schema() -> dict:
    return {
        "type": "object",
        "properties": {field: {"type": "string"} for field in FIELDS if field != "incident_description"},
        "required": [field for field in FIELDS if field != "incident_description"],
        "additionalProperties": False,
    }


def map_extraction(values: dict, scenario: str) -> dict[str, str]:
    """Only accept verbatim spans of the source; preserve the full original account."""
    source = " ".join(scenario.split()).casefold()
    result = {}
    for field in FIELDS:
        if field == "incident_description":
            result[field] = scenario
            continue
        candidate = values.get(field, "")
        if not isinstance(candidate, str):
            candidate = ""
        candidate = candidate.strip()
        supported = candidate and " ".join(candidate.split()).casefold() in source
        if field == "complainant_description" and supported:
            identity_sentences = re.split(r"(?<=[.!?])\s+|\n+", scenario)
            supported = any(
                re.search(r"\b(?:my name is|i am called|my address is|i live at|i reside at|my age is|i am aged|complainant(?:'s)? name is)\b", sentence, re.IGNORECASE)
                and " ".join(candidate.split()).casefold() in " ".join(sentence.split()).casefold()
                for sentence in identity_sentences
            )
        result[field] = candidate if supported else ""
    return result


def format_draft(info: dict[str, str]) -> str:
    def shown(field: str) -> str:
        return info.get(field) or "Not specified"

    return "\n".join((
        "FIR / COMPLAINT DRAFT FOR REVIEW — NOT AN OFFICIALLY REGISTERED FIR",
        "",
        "To,",
        "The Station House Officer,",
        "Police station: Not specified",
        "",
        f"Subject: Complaint regarding {info.get('incident_type') or 'the reported incident'}",
        "",
        "Respected Sir/Madam,",
        "",
        "I wish to report the following incident, according to the account provided:",
        f"Date: {shown('incident_date')}",
        f"Time: {shown('incident_time')}",
        f"Location: {shown('incident_location')}",
        "",
        "Complainant's account:",
        shown("incident_description"),
        "",
        f"Property/items involved: {shown('property_involved')}",
        f"Suspect description: {shown('suspect_description')}",
        f"Vehicle details: {shown('vehicle_details')}",
        f"Witness details: {shown('witness_details')}",
        f"Evidence mentioned: {shown('evidence_mentioned')}",
        f"Additional information: {shown('additional_information')}",
        "",
        "I request that the matter be examined and appropriate action be taken in accordance with applicable law.",
        "",
        "Yours faithfully,",
        f"Complainant details as stated: {shown('complainant_description')}",
        "Signature: To be completed after review",
        "",
        "Draft for human review only. No legal sections have been assigned.",
    ))
