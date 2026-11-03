

# Label Studio Enhanced: Open Source  
# User Stories 1 - 7 Documentation
# Bug Reports and Technical Documention


---

## Overview

Label Studio Enhanced is a set of targeted contributions to the open-source Label Studio annotation platform. These changes address bugs, usability gaps, and documentation issues identified through hands-on use and GitHub issue analysis. All changes are backward-compatible with Label Studio v1.23.0.

---

***
This was a group project completed as part of the CSS 566: Software Management course at the University of Washington Bothell (UWB), in collaboration with teammates NityaSree and Deen.

---

## Features

### US1 — Filter Isolation on Datasets
**Type:** Investigation | **Status:** Closed — Already Fixed

Filters applied by one annotator in the Data Manager no longer affect other users working on the same dataset. Each user's filter view is scoped to their own session.

**Finding:** Tested with two simultaneous user sessions (Chrome + Safari). Filters applied by User 1 were not visible to User 2. This bug was already resolved in Label Studio v1.24.0.dev0. No code changes required.

---

### US2 — Keyboard Shortcut Reliability
**Type:** Bug | **Status:** Investigated  
**GitHub Issue:** #9697

Keyboard shortcuts (e.g., Shift+ArrowKey) stop working after several labeling tasks in the same session. The suspected root cause is keyboard event listener lifecycle issues in the Menubar component.

**Relevant file:** `web/apps/labelstudio/src/components/Menubar/Menubar.jsx`

**Test cases written:** Shortcut behavior at session start, after 5+ tasks, after task transitions, after page refresh.

---

### US3 — Prediction Deletion Logic Refactoring
**Type:** Bug Fix | **Status:** Done  
**GitHub Issue:** #9717 | **Pull Request:** #36

Predictions imported without a `model_version` field can now be deleted without a validation error.

**Root cause:** The delete endpoint used `if not model_version`, which treats empty string `""` as falsy — blocking deletion even though the import endpoint accepted empty strings (`allow_blank=True`). 

**Fix applied in:** `label_studio/projects/api.py` line 886

```python
# Before
if not model_version:
    raise RestValidationError('model_version param is required')

# After
if model_version is None:
    raise RestValidationError('model_version param is required')
```

**To reproduce the bug (before fix):**
1. Import tasks using a JSON file with `"model_version": ""`
2. Go to Project Settings → Predictions → attempt to delete
3. Error: `Validation error: model_version param is required`

After the fix, deletion succeeds for empty-string model versions. Validation is preserved for truly missing (`None`) values.

---

### US4 — UI Gaps: Project Icon Tooltips, Task Instructions, Custom Themes
**Type:** Enhancement | **Status:** Documented

Three UI gaps were identified and addressed through documentation and lightweight implementation:

1. **Project card icon tooltips** — The three stat icons on project cards (completed annotations, skipped tasks, predictions) show numbers with no labels. Tooltip wrappers with descriptive labels have been added.

2. **Task instructions visibility** — Labeling instructions exist but are hidden behind a popup button. Instructions are now displayed by default when a project manager has added them.

3. **Custom themes** — Label Studio's theme folder at `web/apps/labelstudio/src/themes/default/` uses CSS variables. Documentation has been added to the README explaining how to override these variables for custom branding or high-contrast modes.

**Relevant files:**
- `web/apps/labelstudio/src/pages/Projects/ProjectsList.jsx` (icon tooltips)
- `web/apps/labelstudio/src/pages/DataManager/DataManager.jsx` (task instructions)
- `web/apps/labelstudio/src/themes/default/` (theme variables)

---

### US5 — Project and Template Search Functionality
**Type:** Enhancement | **Status:** Done  
**Pull Request:** #71

A search bar has been added to both the Projects dashboard and the Labeling Template gallery, allowing project managers to find projects and templates by name without manually scrolling.

**Project search** (`web/apps/labelstudio/src/pages/Projects/Projects.jsx`):
- Filters by project title and description in real time
- State: `searchQuery`, derived value: `filteredProjects`
- No backend change required — client-side filtering

**Template search** (`web/apps/labelstudio/src/pages/CreateProject/Config/TemplatesList.jsx`):
- Filters by template title in real time
- State: `templateSearch`, helper: `getFilteredTemplates()`
- No backend change required — templates are loaded into memory at render time

---

### US6 — Prediction Score Filter UI
**Type:** Enhancement | **Status:** Done (Backend)  
**Pull Request:** #69

ML engineers can now filter tasks in the Data Manager by prediction confidence score range, allowing them to focus manual review on low-confidence predictions.

**Backend changes:**

`label_studio/tasks/api.py` — Added `TaskFilterSet`:
```python
class TaskFilterSet(FilterSet):
    prediction_score_min = NumberFilter(
        field_name='avg_prediction_score', lookup_expr='gte'
    )
    prediction_score_max = NumberFilter(
        field_name='avg_prediction_score', lookup_expr='lte'
    )
    class Meta:
        model = Task
        fields = ['project', 'prediction_score_min', 'prediction_score_max']
```

`label_studio/tasks/models.py` — Added field:
```python
avg_prediction_score = models.FloatField(null=True, blank=True, db_index=True)
```

**API usage:**
```
GET /api/tasks?project=1&prediction_score_min=0.0&prediction_score_max=0.5
```
Returns only tasks where the average prediction score is between 0.0 and 0.5.

**Migration:** `label_studio/tasks/migrations/0062_task_avg_prediction_score.py`

---

### US7 — Data Management Controls: Restore DangerZone Delete Controls
**Type:** Bug Fix | **Status:** Done  
**Pull Request:** #72

The three delete buttons in Project Settings → Danger Zone (Delete Annotations, Delete Tasks, Delete Predictions) now work correctly. They were previously hardcoded as permanently disabled.

**Root cause:** During a past refactor, the conditional logic was commented out and replaced with `disabled: true`.

**Fix applied in:** `web/apps/labelstudio/src/pages/Settings/DangerZone.jsx` lines 164–174

```javascript
// Before (broken)
{ type: "annotations", disabled: true }
{ type: "tasks",       disabled: true }
{ type: "predictions", disabled: true }

// After (restored)
{ type: "annotations", disabled: !project.total_annotations_number }
{ type: "tasks",       disabled: !project.task_number }
{ type: "predictions", disabled: !project.total_predictions_number }
```

Each button is now enabled when the corresponding data exists and disabled when there is nothing to delete.

---

### US8 — Installation and Setup Documentation
**Type:** Documentation | **Status:** Done  
**Pull Request:** #73

The README has been updated with Mac-specific setup instructions, a corrected Poetry workflow, frontend build steps, and a troubleshooting section.

**What was added:**
- Homebrew + Python 3.11 installation steps for macOS
- Correct `poetry install` and `poetry run python3.11` commands
- Node.js and `yarn build` instructions for frontend development
- Troubleshooting section: `zsh: command not found: python`, port conflicts, blank page after login
- Step-by-step PR submission guide added to CONTRIBUTING.md

**See:** `README.md` and `CONTRIBUTING.md` in the root of the repository.

---

## Running Label Studio Enhanced Locally (Mac)

```bash
# 1. Clone the repository

# 2. Install Python 3.11 via Homebrew
brew install python@3.11

# 3. Install Poetry
pip3.11 install poetry

# 4. Install Python dependencies
poetry install

# 5. Run database migrations
poetry run python3.11 label_studio/manage.py migrate

# 6. Collect static files
poetry run python3.11 label_studio/manage.py collectstatic --noinput

# 7. Install frontend dependencies and build
cd web && yarn install && yarn build && cd ..

# 8. Start the server
poetry run python3.11 label_studio/manage.py runserver
```

Open http://127.0.0.1:8080 in your browser.

---

## Pull Request Summary

| PR | User Story | Description |
|----|-----------|-------------|
| #36 | US3 | Fix prediction deletion validation error |
| #45 | US3 | Test cases for prediction deletion fix |
| #69 | US6 | Backend prediction score filtering API |
| #71 | US5 | Project and template search bars |
| #72 | US7 | Restore DangerZone delete controls |
| #73 | US8 | Mac setup and installation documentation |

---

## References

- Label Studio GitHub: https://github.com/HumanSignal/label-studio
- GitHub Issue #9717 (Predictions Deletion): https://github.com/HumanSignal/label-studio/issues/9717
- GitHub Issue #9697 (Keyboard Shortcuts): https://github.com/HumanSignal/label-studio/issues/9697


