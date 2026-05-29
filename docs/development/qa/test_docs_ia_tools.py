"""Tests for documentation changes in PR: ia-tools section added to docs/.

Covers:
- docs/README.md: new ia-tools/ section and navigation table row
- docs/ia-tools/agent-role-hive-prompts.md: full structure, canvas template,
  agent profiles, labels, kanban columns, prompts, and decision values.
"""

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).parent.parent.parent
DOCS_README = REPO_ROOT / "docs" / "README.md"
HIVE_PROMPTS = REPO_ROOT / "docs" / "ia-tools" / "agent-role-hive-prompts.md"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def readme_content() -> str:
    return DOCS_README.read_text(encoding="utf-8")


@pytest.fixture(scope="module")
def hive_content() -> str:
    return HIVE_PROMPTS.read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# docs/README.md — only the lines changed in this PR
# ---------------------------------------------------------------------------


class TestReadmeIaToolsSection:
    """The README must contain the new ia-tools/ documentation section."""

    def test_ia_tools_section_heading_present(self, readme_content):
        assert "ia-tools/" in readme_content

    def test_ia_tools_section_has_robot_emoji(self, readme_content):
        # The heading added uses the 🤖 emoji
        assert "🤖" in readme_content

    def test_ia_tools_section_links_to_directory(self, readme_content):
        assert "(./ia-tools/)" in readme_content

    def test_ia_tools_section_links_to_hive_prompts_file(self, readme_content):
        assert "agent-role-hive-prompts.md" in readme_content

    def test_ia_tools_section_describes_agent_profiles(self, readme_content):
        assert "Perfiles de agentes especializados" in readme_content

    def test_ia_tools_section_describes_canvas_evaluation(self, readme_content):
        assert "canvas de evaluación" in readme_content

    def test_ia_tools_section_describes_pr_triage(self, readme_content):
        assert "triage de PRs" in readme_content


class TestReadmeNavigationTable:
    """The navigation quick-access table must include the ia-tools row."""

    def test_nav_table_has_ia_tools_row(self, readme_content):
        assert "Operar agentes IA" in readme_content

    def test_nav_table_ia_tools_links_to_directory(self, readme_content):
        # Table cell must link to ia-tools/
        assert "[ia-tools/](./ia-tools/)" in readme_content

    def test_nav_table_ia_tools_row_has_robot_emoji(self, readme_content):
        # Find the table row that has the ia-tools link and verify emoji
        lines = readme_content.splitlines()
        ia_row = next((ln for ln in lines if "Operar agentes IA" in ln), None)
        assert ia_row is not None, "Navigation table row for ia-tools not found"
        assert "🤖" in ia_row

    def test_nav_table_ia_tools_row_is_inside_table(self, readme_content):
        lines = readme_content.splitlines()
        ia_row = next((ln for ln in lines if "Operar agentes IA" in ln), None)
        assert ia_row is not None
        # Markdown table rows start with '|'
        assert ia_row.strip().startswith("|")


# ---------------------------------------------------------------------------
# docs/ia-tools/agent-role-hive-prompts.md — file-level basics
# ---------------------------------------------------------------------------


class TestHivePromptsFileBasics:
    def test_file_exists(self):
        assert HIVE_PROMPTS.exists(), "agent-role-hive-prompts.md must exist"

    def test_file_is_non_empty(self, hive_content):
        assert len(hive_content.strip()) > 0

    def test_file_has_correct_h1_title(self, hive_content):
        assert hive_content.startswith("# Agent Role Hive Prompts")

    def test_file_is_utf8_readable(self):
        # Encoding is validated by the fixture; here we just assert no BOM
        raw = HIVE_PROMPTS.read_bytes()
        assert not raw.startswith(b"\xef\xbb\xbf"), "File must not have a UTF-8 BOM"


# ---------------------------------------------------------------------------
# Top-level sections
# ---------------------------------------------------------------------------


REQUIRED_TOP_LEVEL_SECTIONS = [
    "## Objetivo",
    "## Principios",
    "## Canvas de Evaluacion",
    "## Tablero Kanban Recomendado",
    "## Reglas De Cierre Rapido",
    "## Reglas De Rescate",
    "## Prompt Maestro Para Triage Inicial",
    "## Prompt Para Consolidar Decisiones",
    "## Ejemplo De Uso Sobre PRs Automatizadas",
    "## Cadencia Recomendada",
    "## Definicion De Hecho",
]


@pytest.mark.parametrize("section", REQUIRED_TOP_LEVEL_SECTIONS)
def test_required_top_level_section_present(hive_content, section):
    assert section in hive_content, f"Missing required section: {section}"


# ---------------------------------------------------------------------------
# Principles section
# ---------------------------------------------------------------------------


class TestPrinciplesSection:
    def test_has_eight_numbered_principles(self, hive_content):
        # Each principle starts with "N. " on its own line
        principles = re.findall(r"^\d+\.", hive_content, re.MULTILINE)
        assert len(principles) >= 8, "Expected at least 8 numbered principles"

    def test_principle_distinguishes_ux_from_ui(self, hive_content):
        assert "UX evalua flujo" in hive_content

    def test_principle_accessibility_is_own_criterion(self, hive_content):
        assert "Accesibilidad es un criterio propio" in hive_content

    def test_principle_recommendation_requires_evidence(self, hive_content):
        assert "recomendacion sin evidencia no cuenta" in hive_content


# ---------------------------------------------------------------------------
# Canvas template
# ---------------------------------------------------------------------------


REQUIRED_CANVAS_FIELDS = [
    "Item:",
    "Titulo:",
    "Fuente:",
    "Rol evaluador:",
    "Fecha:",
    "Base branch:",
    "Head branch:",
    "Archivos tocados:",
    "Checks observados:",
    "## Claim Principal",
    "## Evidencia Revisada",
    "## Puntajes",
    "## Decision Recomendada",
    "## Razon",
    "## Condiciones Para Avanzar",
    "## Comentario Sugerido Para GitHub",
]


@pytest.mark.parametrize("field", REQUIRED_CANVAS_FIELDS)
def test_canvas_template_has_required_field(hive_content, field):
    assert field in hive_content, f"Canvas template missing required field: {field}"


class TestCanvasTemplate:
    def test_evidencia_revisada_has_diff_item(self, hive_content):
        assert "- Diff:" in hive_content

    def test_evidencia_revisada_has_tests_checks_item(self, hive_content):
        assert "- Tests/checks:" in hive_content

    def test_puntajes_has_valor_funcional(self, hive_content):
        assert "Valor funcional: 1-10" in hive_content

    def test_puntajes_has_calidad_implementacion(self, hive_content):
        assert "Calidad de implementacion: 1-10" in hive_content

    def test_puntajes_has_seguridad(self, hive_content):
        assert "Seguridad al aceptar: 1-10" in hive_content

    def test_puntajes_has_riesgo_regresion(self, hive_content):
        assert "Riesgo de regresion: bajo / medio / alto" in hive_content

    def test_puntajes_has_frescura(self, hive_content):
        assert "Frescura del cambio: vigente / stale / duplicado / desconocido" in hive_content

    def test_decision_options_listed_in_canvas(self, hive_content):
        assert "merge / modify / rescue / close / investigate" in hive_content

    def test_condiciones_para_avanzar_has_checkboxes(self, hive_content):
        assert "- [ ] Condicion 1" in hive_content
        assert "- [ ] Condicion 2" in hive_content

    def test_canvas_template_is_fenced_code_block(self, hive_content):
        # The canvas must be inside a ```md code fence
        canvas_match = re.search(r"```md\s*# Agent Review Canvas", hive_content)
        assert canvas_match, "Canvas template must be in a ```md fenced code block"


# ---------------------------------------------------------------------------
# Kanban board
# ---------------------------------------------------------------------------


REQUIRED_KANBAN_COLUMNS = [
    "Inbox",
    "Needs Triage",
    "Role Review",
    "Valuable",
    "Needs Changes",
    "Rescue Candidate",
    "Ready To Merge",
    "Duplicate / Superseded",
    "No Functional Value",
    "Closed",
    "Merged",
]


@pytest.mark.parametrize("column", REQUIRED_KANBAN_COLUMNS)
def test_kanban_column_defined(hive_content, column):
    assert column in hive_content, f"Kanban column missing: {column}"


class TestLabels:
    """Labels must follow the prefix:value naming convention."""

    REQUIRED_AGENT_LABELS = [
        "agent:producto",
        "agent:ux",
        "agent:ui",
        "agent:accessibility",
        "agent:security",
        "agent:architecture",
        "agent:qa",
        "agent:docs",
    ]

    REQUIRED_VALUE_LABELS = [
        "value:high",
        "value:medium",
        "value:low",
        "value:none",
    ]

    REQUIRED_DECISION_LABELS = [
        "decision:merge",
        "decision:modify",
        "decision:rescue",
        "decision:close",
        "decision:investigate",
    ]

    REQUIRED_REASON_LABELS = [
        "reason:duplicate",
        "reason:superseded",
        "reason:validate-failed",
        "reason:empty-diff",
        "reason:no-functional-value",
        "reason:needs-ci",
        "reason:security-review",
        "reason:stale-snapshot",
    ]

    @pytest.mark.parametrize("label", REQUIRED_AGENT_LABELS)
    def test_agent_label_present(self, hive_content, label):
        assert label in hive_content, f"Missing agent label: {label}"

    @pytest.mark.parametrize("label", REQUIRED_VALUE_LABELS)
    def test_value_label_present(self, hive_content, label):
        assert label in hive_content, f"Missing value label: {label}"

    @pytest.mark.parametrize("label", REQUIRED_DECISION_LABELS)
    def test_decision_label_present(self, hive_content, label):
        assert label in hive_content, f"Missing decision label: {label}"

    @pytest.mark.parametrize("label", REQUIRED_REASON_LABELS)
    def test_reason_label_present(self, hive_content, label):
        assert label in hive_content, f"Missing reason label: {label}"

    def test_labels_use_colon_separator(self, hive_content):
        # All labels in the labels block follow prefix:value format
        label_block_match = re.search(
            r"Labels sugeridos:\s*```txt\s*(.*?)```", hive_content, re.DOTALL
        )
        assert label_block_match, "Could not find labels block"
        labels_text = label_block_match.group(1)
        label_lines = [ln.strip() for ln in labels_text.strip().splitlines() if ln.strip()]
        for label in label_lines:
            assert re.match(r"^[a-z]+:[a-z0-9\-]+$", label), (
                f"Label '{label}' does not follow prefix:value format"
            )


# ---------------------------------------------------------------------------
# Quick-close rules
# ---------------------------------------------------------------------------


class TestQuickCloseRules:
    def test_section_has_empty_diff_rule(self, hive_content):
        assert "Diff vacio" in hive_content

    def test_section_has_validate_failed_rule(self, hive_content):
        assert "ERROR: validate failed" in hive_content

    def test_section_has_duplicate_rule(self, hive_content):
        assert "Es duplicada" in hive_content

    def test_section_has_future_date_rule(self, hive_content):
        assert "fecha futura" in hive_content

    def test_section_has_dependency_without_justification_rule(self, hive_content):
        assert "Cambia dependencias sin justificacion" in hive_content

    def test_section_has_at_least_five_rules(self, hive_content):
        # Extract content between Reglas De Cierre Rapido and Reglas De Rescate
        match = re.search(
            r"## Reglas De Cierre Rapido\s*(.*?)## Reglas De Rescate",
            hive_content,
            re.DOTALL,
        )
        assert match, "Could not find Reglas De Cierre Rapido section"
        section_text = match.group(1)
        bullet_items = re.findall(r"^- ", section_text, re.MULTILINE)
        assert len(bullet_items) >= 5, "Expected at least 5 quick-close rules"


# ---------------------------------------------------------------------------
# Rescue rules
# ---------------------------------------------------------------------------


class TestRescueRules:
    def test_rescue_requires_good_idea(self, hive_content):
        assert "La idea es buena" in hive_content

    def test_rescue_for_stale_prs(self, hive_content):
        assert "stale o conflictiva" in hive_content

    def test_rescue_produces_minimal_patch(self, hive_content):
        assert "patch minimo" in hive_content

    def test_rescue_section_has_at_least_three_conditions(self, hive_content):
        match = re.search(
            r"## Reglas De Rescate\s*(.*?)## Perfil:",
            hive_content,
            re.DOTALL,
        )
        assert match, "Could not find Reglas De Rescate section"
        section_text = match.group(1)
        bullet_items = re.findall(r"^- ", section_text, re.MULTILINE)
        assert len(bullet_items) >= 3, "Expected at least 3 rescue conditions"


# ---------------------------------------------------------------------------
# Agent profiles — presence and substructure
# ---------------------------------------------------------------------------


AGENT_PROFILES = [
    "Producto",
    "UX",
    "UI Visual",
    "Accesibilidad",
    "Seguridad",
    "Arquitectura E Ingenieria",
    "QA Y CI",
    "Documentacion Y Knowledge Base",
]


@pytest.mark.parametrize("profile", AGENT_PROFILES)
def test_agent_profile_section_present(hive_content, profile):
    assert f"## Perfil: {profile}" in hive_content, (
        f"Missing agent profile section: {profile}"
    )


@pytest.mark.parametrize("profile", AGENT_PROFILES)
def test_agent_profile_has_proposito_subsection(hive_content, profile):
    # After each Perfil heading we expect ### Proposito
    profile_idx = hive_content.find(f"## Perfil: {profile}")
    assert profile_idx != -1
    # Find next profile or end of file
    next_profile_idx = hive_content.find("## Perfil:", profile_idx + 1)
    section = hive_content[profile_idx: next_profile_idx if next_profile_idx != -1 else None]
    assert "### Proposito" in section, f"Profile '{profile}' missing ### Proposito"


@pytest.mark.parametrize("profile", AGENT_PROFILES)
def test_agent_profile_has_debe_revisar_subsection(hive_content, profile):
    profile_idx = hive_content.find(f"## Perfil: {profile}")
    assert profile_idx != -1
    next_profile_idx = hive_content.find("## Perfil:", profile_idx + 1)
    section = hive_content[profile_idx: next_profile_idx if next_profile_idx != -1 else None]
    assert "### Debe Revisar" in section, f"Profile '{profile}' missing ### Debe Revisar"


@pytest.mark.parametrize("profile", AGENT_PROFILES)
def test_agent_profile_has_prompt_subsection(hive_content, profile):
    profile_idx = hive_content.find(f"## Perfil: {profile}")
    assert profile_idx != -1
    next_profile_idx = hive_content.find("## Perfil:", profile_idx + 1)
    section = hive_content[profile_idx: next_profile_idx if next_profile_idx != -1 else None]
    assert "### Prompt" in section, f"Profile '{profile}' missing ### Prompt"


@pytest.mark.parametrize("profile", AGENT_PROFILES)
def test_agent_profile_prompt_ends_with_canvas_delivery(hive_content, profile):
    """Every agent prompt must end with the standard canvas delivery instruction."""
    profile_idx = hive_content.find(f"## Perfil: {profile}")
    assert profile_idx != -1
    next_profile_idx = hive_content.find("## Perfil:", profile_idx + 1)
    section = hive_content[profile_idx: next_profile_idx if next_profile_idx != -1 else None]
    assert "Entrega solo el Agent Review Canvas completo." in section, (
        f"Profile '{profile}' prompt does not end with canvas delivery instruction"
    )


@pytest.mark.parametrize("profile", AGENT_PROFILES)
def test_agent_profile_prompt_has_rules_block(hive_content, profile):
    """Every agent prompt must include a Reglas: block."""
    profile_idx = hive_content.find(f"## Perfil: {profile}")
    assert profile_idx != -1
    next_profile_idx = hive_content.find("## Perfil:", profile_idx + 1)
    section = hive_content[profile_idx: next_profile_idx if next_profile_idx != -1 else None]
    assert "Reglas:" in section, f"Profile '{profile}' prompt missing Reglas: block"


# ---------------------------------------------------------------------------
# Agent prompt content specifics
# ---------------------------------------------------------------------------


class TestAgentPromptContent:
    def test_producto_prompt_mentions_checkout(self, hive_content):
        assert "checkout" in hive_content

    def test_seguridad_prompt_requires_strong_evidence_for_auth(self, hive_content):
        assert "exige evidencia fuerte" in hive_content

    def test_accesibilidad_prompt_mentions_voiceover_talkback(self, hive_content):
        assert "VoiceOver/TalkBack" in hive_content

    def test_ui_prompt_instructs_no_redesign(self, hive_content):
        assert "no inventes una direccion visual nueva" in hive_content

    def test_qa_prompt_expects_pytest_for_backend(self, hive_content):
        assert "espera pytest" in hive_content

    def test_arquitectura_prompt_mentions_zustand(self, hive_content):
        assert "Zustand" in hive_content

    def test_docs_prompt_rejects_empty_diff(self, hive_content):
        assert "diff vacio" in hive_content

    def test_seguridad_prompt_mentions_unauthenticated_endpoints(self, hive_content):
        assert "/health" in hive_content

    def test_ux_prompt_distinguishes_ux_from_ui(self, hive_content):
        assert "Distingue UX de UI" in hive_content


# ---------------------------------------------------------------------------
# Triage and Decision Synthesizer prompts
# ---------------------------------------------------------------------------


class TestTriagePrompt:
    def test_triage_section_present(self, hive_content):
        assert "## Prompt Maestro Para Triage Inicial" in hive_content

    def test_triage_prompt_outputs_type(self, hive_content):
        assert "Tipo probable" in hive_content

    def test_triage_prompt_outputs_required_profiles(self, hive_content):
        assert "Perfiles requeridos" in hive_content

    def test_triage_prompt_outputs_quick_close_signals(self, hive_content):
        assert "Senales de cierre rapido" in hive_content

    def test_triage_prompt_outputs_priority(self, hive_content):
        assert "Prioridad" in hive_content

    def test_triage_prompt_outputs_kanban_column(self, hive_content):
        assert "Siguiente columna kanban" in hive_content

    def test_triage_prompt_always_includes_security_for_payments(self, hive_content):
        assert "toca pagos/auth/permisos/env/dependencias, incluye siempre seguridad" in hive_content

    def test_triage_prompt_identifies_self_as_triage_agent(self, hive_content):
        assert "Triage Agent de HealthBytes" in hive_content


class TestDecisionSynthesizerPrompt:
    def test_synthesizer_section_present(self, hive_content):
        assert "## Prompt Para Consolidar Decisiones" in hive_content

    def test_synthesizer_outputs_final_decision(self, hive_content):
        assert "Decision final:" in hive_content

    def test_synthesizer_outputs_final_score(self, hive_content):
        assert "Score final 1-10" in hive_content

    def test_synthesizer_outputs_main_risk(self, hive_content):
        assert "Riesgo principal" in hive_content

    def test_synthesizer_outputs_merge_conditions(self, hive_content):
        assert "Condiciones antes de merge" in hive_content

    def test_synthesizer_outputs_github_comment(self, hive_content):
        assert "Comentario final para GitHub" in hive_content

    def test_synthesizer_outputs_recommended_labels(self, hive_content):
        assert "Labels recomendados" in hive_content

    def test_synthesizer_outputs_kanban_column(self, hive_content):
        assert "Columna kanban recomendada" in hive_content

    def test_synthesizer_blocks_merge_on_high_security_risk(self, hive_content):
        assert "Seguridad marca riesgo alto, no puedes recomendar merge directo" in hive_content

    def test_synthesizer_blocks_merge_on_insufficient_qa(self, hive_content):
        assert "QA marca checks insuficientes" in hive_content

    def test_synthesizer_recommends_close_on_low_product_value(self, hive_content):
        assert "Producto marca valor 0-2" in hive_content

    def test_synthesizer_recommends_rescue_for_good_idea_in_bad_pr(self, hive_content):
        assert "hay una idea util dentro de una PR mala, recomienda rescue" in hive_content

    def test_synthesizer_sends_investigate_on_contradiction(self, hive_content):
        assert "perfiles contradicen" in hive_content

    def test_synthesizer_identifies_itself(self, hive_content):
        assert "Decision Synthesizer de HealthBytes" in hive_content


# ---------------------------------------------------------------------------
# Examples section
# ---------------------------------------------------------------------------


class TestExamplesSection:
    def test_example_validate_failed_closes(self, hive_content):
        assert "docs(sync): validate failed" in hive_content
        assert "Decision: close" in hive_content

    def test_example_duplicate_closes_or_rescues(self, hive_content):
        assert "decision:close, reason:duplicate" in hive_content

    def test_example_accessibility_labels_merges(self, hive_content):
        assert "accessibility labels con tests" in hive_content
        assert "value:high, decision:merge" in hive_content

    def test_examples_cover_all_three_scenarios(self, hive_content):
        # Count distinct md blocks in the examples section
        examples_match = re.search(
            r"## Ejemplo De Uso Sobre PRs Automatizadas\s*(.*?)## Cadencia",
            hive_content,
            re.DOTALL,
        )
        assert examples_match, "Examples section not found"
        section = examples_match.group(1)
        # Each example is inside ```md ... ```
        examples = re.findall(r"```md\s*PR:", section)
        assert len(examples) >= 3, "Expected at least 3 usage examples"

    def test_example_validate_failed_has_labels(self, hive_content):
        assert "reason:validate-failed" in hive_content
        assert "value:none" in hive_content

    def test_example_accessibility_has_agent_labels(self, hive_content):
        assert "agent:accessibility" in hive_content
        assert "agent:qa" in hive_content

    def test_example_validate_failed_signals_include_empty_diff(self, hive_content):
        assert "Diff vacio o solo README/CHANGELOG stale" in hive_content


# ---------------------------------------------------------------------------
# Cadence section
# ---------------------------------------------------------------------------


class TestCadenceSection:
    def test_daily_cadence_defined(self, hive_content):
        assert "Diario:" in hive_content

    def test_weekly_cadence_defined(self, hive_content):
        assert "Semanal:" in hive_content

    def test_daily_cadence_starts_with_triage(self, hive_content):
        match = re.search(r"Diario:\s*(.*?)Semanal:", hive_content, re.DOTALL)
        assert match, "Diario section not found"
        assert "Triage Agent" in match.group(1)

    def test_weekly_cadence_reviews_noise_patterns(self, hive_content):
        assert "patrones de ruido" in hive_content

    def test_weekly_cadence_converts_rescues_to_instructions(self, hive_content):
        assert "rescates repetidos en instrucciones" in hive_content

    def test_daily_cadence_has_four_steps(self, hive_content):
        match = re.search(r"Diario:\s*(.*?)Semanal:", hive_content, re.DOTALL)
        assert match
        steps = re.findall(r"^\d+\.", match.group(1), re.MULTILINE)
        assert len(steps) >= 4


# ---------------------------------------------------------------------------
# Definition of Done
# ---------------------------------------------------------------------------


class TestDefinitionOfDone:
    def test_dod_section_present(self, hive_content):
        assert "## Definicion De Hecho" in hive_content

    def test_dod_mentions_automated_prs_closed_fast(self, hive_content):
        assert "PRs automatizadas vacias o fallidas se cierran rapido" in hive_content

    def test_dod_mentions_duplicates_detected_early(self, hive_content):
        assert "Las duplicadas se detectan antes de gastar revision profunda" in hive_content

    def test_dod_mentions_security_changes_not_merged_without_review(self, hive_content):
        assert "cambios de seguridad no se mergean sin revision especifica" in hive_content

    def test_dod_mentions_ux_ui_accessibility_separate_evidence(self, hive_content):
        assert "UX, UI y accesibilidad dejan evidencia separada" in hive_content

    def test_dod_mentions_valuable_prs_have_conditions(self, hive_content):
        assert "PRs valiosas tienen condiciones claras antes de merge" in hive_content

    def test_dod_mentions_rescue_produces_clean_patches(self, hive_content):
        assert "ideas utiles de PRs malas se rescatan como patches limpios" in hive_content

    def test_dod_has_at_least_five_criteria(self, hive_content):
        match = re.search(
            r"## Definicion De Hecho\s*(.*?)$", hive_content, re.DOTALL
        )
        assert match
        criteria = re.findall(r"^- ", match.group(1), re.MULTILINE)
        assert len(criteria) >= 5


# ---------------------------------------------------------------------------
# Boundary / regression tests
# ---------------------------------------------------------------------------


class TestBoundaryAndRegression:
    def test_no_future_years_in_content(self, hive_content):
        # The doc itself should not introduce references to years 2030+
        suspicious = re.findall(r"20[3-9]\d", hive_content)
        assert len(suspicious) == 0, (
            f"Found suspicious future year references: {suspicious}"
        )

    def test_file_does_not_contain_placeholder_text(self, hive_content):
        assert "TODO" not in hive_content
        assert "FIXME" not in hive_content
        assert "PLACEHOLDER" not in hive_content

    def test_all_decision_values_are_lowercase(self, hive_content):
        # The canonical decision line uses lowercase values
        assert "merge / modify / rescue / close / investigate" in hive_content

    def test_decision_label_values_are_lowercase(self, hive_content):
        for decision in ("decision:merge", "decision:modify", "decision:rescue",
                         "decision:close", "decision:investigate"):
            assert decision in hive_content

    def test_hive_prompts_file_not_linked_from_wrong_path_in_readme(self, readme_content):
        # Ensure the link in README points to correct relative path
        assert "(./ia-tools/agent-role-hive-prompts.md)" in readme_content

    def test_readme_ia_tools_section_comes_before_navigation_table(self, readme_content):
        ia_section_idx = readme_content.find("[ia-tools/](./ia-tools/)")
        nav_row_idx = readme_content.find("Operar agentes IA")
        assert ia_section_idx < nav_row_idx, (
            "ia-tools section link should appear before the navigation table row"
        )

    def test_eight_agent_profiles_total(self, hive_content):
        profiles = re.findall(r"^## Perfil:", hive_content, re.MULTILINE)
        assert len(profiles) == 8, f"Expected exactly 8 agent profiles, found {len(profiles)}"

    def test_canvas_template_is_fenced_code_block(self, hive_content):
        # The canvas must be inside a ```md code fence
        canvas_match = re.search(r"```md\s*# Agent Review Canvas", hive_content)
        assert canvas_match, "Canvas template must be in a ```md fenced code block"

    def test_ia_tools_directory_exists(self):
        ia_tools_dir = REPO_ROOT / "docs" / "ia-tools"
        assert ia_tools_dir.is_dir(), "docs/ia-tools/ directory must exist"

    def test_readme_ia_tools_section_appears_after_frontend_section(self, readme_content):
        frontend_idx = readme_content.find("### 📱")
        ia_tools_heading_idx = readme_content.find("### 🤖")
        assert frontend_idx != -1, "Frontend section not found in README"
        assert ia_tools_heading_idx != -1, "ia-tools heading not found in README"
        assert frontend_idx < ia_tools_heading_idx, (
            "ia-tools section should appear after the frontend section"
        )
