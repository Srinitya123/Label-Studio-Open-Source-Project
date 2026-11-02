def validate_prediction(prediction):
    """
    Basic validation for Bug 3:
    Checks whether a prediction has the required model_version field.
    """
    if "model_version" not in prediction:
        return False, "Missing model_version"

    return True, "Valid prediction"


def test_missing_model_version():
    prediction = {
        "result": []
    }

    is_valid, message = validate_prediction(prediction)

    assert is_valid is False
    assert message == "Missing model_version"


def test_with_model_version():
    prediction = {
        "model_version": "test-model-v1",
        "result": []
    }

    is_valid, message = validate_prediction(prediction)

    assert is_valid is True
    assert message == "Valid prediction"


if __name__ == "__main__":
    test_missing_model_version()
    test_with_model_version()
    print("All Bug 3 model_version validation tests passed.")
