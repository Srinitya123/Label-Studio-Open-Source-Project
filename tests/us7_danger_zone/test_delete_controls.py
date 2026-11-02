def should_enable_delete_button(user_role, item_count):
    """
    Validation logic for US7:
    Delete controls should only be enabled for project managers
    when there is data available to delete.
    """
    if user_role != "manager":
        return False

    if item_count <= 0:
        return False

    return True


def test_manager_with_items_can_delete():
    assert should_enable_delete_button("manager", 3) is True


def test_manager_with_no_items_cannot_delete():
    assert should_enable_delete_button("manager", 0) is False


def test_non_manager_cannot_delete():
    assert should_enable_delete_button("annotator", 3) is False


if __name__ == "__main__":
    test_manager_with_items_can_delete()
    test_manager_with_no_items_cannot_delete()
    test_non_manager_cannot_delete()
    print("All US7 Danger Zone delete control tests passed.")
