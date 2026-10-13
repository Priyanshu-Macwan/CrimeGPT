from pydantic import BaseModel, Field, field_validator


class DraftRequest(BaseModel):
    scenario: str = Field(max_length=10000)

    @field_validator("scenario")
    @classmethod
    def validate_scenario(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 20 or len(value.split()) < 4:
            raise ValueError("Describe the incident in at least four words and 20 characters")
        return value


class DraftResponse(BaseModel):
    extracted_information: dict[str, str]
    fir_draft: str
    model: str


class TranscriptResponse(BaseModel):
    transcript: str


class AudioDraftResponse(DraftResponse):
    transcript: str
