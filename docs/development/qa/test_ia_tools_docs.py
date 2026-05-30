"""
Tests for docs/ia-tools/agent-role-hive-prompts.md and related README.md changes.

Validates structure, required sections, canvas template fields, labels,
agent profiles, and cross-references between the docs index and the new file.
"""
import re
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).parent.parent.parent
DOCS_ROOT = REPO_ROOT / "docs"
DOCS_README = DOCS_ROOT / "README.md"
IA_TOOLS_DIR = DOCS_ROOT / "ia-tools"
AGENT_HIVE_FILE = IA_TOOLS_DIR / "agent-role-hive-prompts.md"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _extract_code_block(content: str, lang: str = "md") -> list[str]:
    """Return the bodies of all fenced code blocks with the given language tag."""
    pattern = rf"```{lang}\n(.*?)```"
    return re.findall(pattern, content, re.DOTALL)


def _h2_sections(content: str) -> list[str]:
    """Return all H2 heading texts."""
    return re.findall(r"^## (.+)$", content, re.MULTILINE)


def _h3_sections(content: str) -> list[str]:
    """Return all H3 heading texts."""
    return re.findall(r"^### (.+)$", content, re.MULTILINE)


# ===========================================================================
# File existence tests
# ===========================================================================


@pytest.mark.unit
class TestFileExistence:
    def test_ia_tools_directory_exists(self):
        assert IA_TOOLS_DIR.is_dir(), "docs/ia-tools/ directory must exist"

    def test_agent_hive_prompts_file_exists(self):
        assert AGENT_HIVE_FILE.is_file(), (
            "docs/ia-tools/agent-role-hive-prompts.md must exist"
        )

    def test_agent_hive_prompts_is_not_empty(self):
        content = _read(AGENT_HIVE_FILE)
        assert len(content.strip()) > 0, "agent-role-hive-prompts.md must not be empty"

    def test_agent_hive_prompts_is_valid_utf8(self):
        # read_text with utf-8 will raise on invalid bytes
        content = _read(AGENT_HIVE_FILE)
        assert isinstance(content, str)

    def test_agent_hive_prompts_minimum_size(self):
        """File should have substantial content (more than 400 lines)."""
        content = _read(AGENT_HIVE_FILE)
        lines = content.splitlines()
        assert len(lines) >= 400, (
            f"Expected at least 400 lines, got {len(lines)}"
        )


# ===========================================================================
# docs/README.md – ia-tools section tests
# ===========================================================================


@pytest.mark.unit
class TestDocsReadmeIaToolsSection:
    def test_readme_has_ia_tools_section_header(self):
        content = _read(DOCS_README)
        assert "[ia-tools/](./ia-tools/)" in content, (
            "docs/README.md must contain a link to ./ia-tools/"
        )

    def test_readme_ia_tools_section_has_description(self):
        content = _read(DOCS_README)
        assert "Prompts y Flujos Para Agentes" in content, (
            "ia-tools section must include description 'Prompts y Flujos Para Agentes'"
        )

    def test_readme_links_to_agent_hive_prompts_file(self):
        content = _read(DOCS_README)
        assert "agent-role-hive-prompts.md" in content, (
            "docs/README.md must link to agent-role-hive-prompts.md"
        )

    def test_readme_ia_tools_link_uses_relative_path(self):
        content = _read(DOCS_README)
        assert "./ia-tools/agent-role-hive-prompts.md" in content, (
            "Link to agent-role-hive-prompts.md must use relative path ./ia-tools/agent-role-hive-prompts.md"
        )

    def test_readme_navigation_table_has_ia_tools_row(self):
        content = _read(DOCS_README)
        assert "Operar agentes IA" in content, (
            "Navigation table must have an 'Operar agentes IA' row"
        )

    def test_readme_navigation_table_ia_tools_link(self):
        content = _read(DOCS_README)
        # The table row must link to ia-tools/
        assert "[ia-tools/](./ia-tools/)" in content, (
            "Navigation table must contain a link [ia-tools/](./ia-tools/)"
        )

    def test_readme_navigation_table_robot_emoji_present(self):
        content = _read(DOCS_README)
        # Both the section header and the table row use 🤖
        assert content.count("🤖") >= 2, (
            "Expected at least two 🤖 emoji occurrences for the ia-tools references"
        )

    def test_linked_file_actually_exists(self):
        """The link referenced in docs/README.md must resolve to a real file."""
        assert AGENT_HIVE_FILE.is_file(), (
            "The file referenced by docs/README.md (ia-tools/agent-role-hive-prompts.md) must exist on disk"
        )


# ===========================================================================
# agent-role-hive-prompts.md – top-level structure
# ===========================================================================


@pytest.mark.unit
class TestAgentHivePromptsTopLevelStructure:
    def test_file_title(self):
        content = _read(AGENT_HIVE_FILE)
        first_line = content.splitlines()[0]
        assert first_line == "# Agent Role Hive Prompts", (
            f"First line must be '# Agent Role Hive Prompts', got: {first_line!r}"
        )

    def test_has_objetivo_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Objetivo" in content

    def test_has_principios_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Principios" in content

    def test_has_canvas_de_evaluacion_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Canvas de Evaluacion" in content

    def test_has_tablero_kanban_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Tablero Kanban Recomendado" in content

    def test_has_reglas_de_cierre_rapido_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Reglas De Cierre Rapido" in content

    def test_has_reglas_de_rescate_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Reglas De Rescate" in content

    def test_has_cadencia_recomendada_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Cadencia Recomendada" in content

    def test_has_definicion_de_hecho_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Definicion De Hecho" in content

    def test_has_ejemplo_de_uso_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Ejemplo De Uso Sobre PRs Automatizadas" in content

    def test_has_prompt_maestro_triage_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Prompt Maestro Para Triage Inicial" in content

    def test_has_prompt_consolidar_decisiones_section(self):
        content = _read(AGENT_HIVE_FILE)
        assert "## Prompt Para Consolidar Decisiones" in content


# ===========================================================================
# Principles
# ===========================================================================


@pytest.mark.unit
class TestPrinciples:
    def test_eight_principles_defined(self):
        content = _read(AGENT_HIVE_FILE)
        # Extract the Principios section up to the next ##
        match = re.search(
            r"## Principios\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match, "Could not find Principios section"
        section = match.group(1)
        numbered_items = re.findall(r"^\d+\.", section, re.MULTILINE)
        assert len(numbered_items) == 8, (
            f"Expected 8 principles, found {len(numbered_items)}"
        )

    def test_principle_ux_ui_distinction(self):
        """Principle 7: UX and UI must be differentiated."""
        content = _read(AGENT_HIVE_FILE)
        assert "UX evalua flujo" in content
        assert "UI evalua jerarquia visual" in content

    def test_principle_security_requires_review(self):
        """Principle 6: security-sensitive areas always require review."""
        content = _read(AGENT_HIVE_FILE)
        assert "Seguridad, pagos, auth, permisos" in content

    def test_principle_accessibility_is_standalone(self):
        """Principle 8: accessibility is its own criterion."""
        content = _read(AGENT_HIVE_FILE)
        assert "Accesibilidad es un criterio propio" in content


# ===========================================================================
# Canvas template fields
# ===========================================================================


@pytest.mark.unit
class TestCanvasTemplate:
    """The canvas code block must contain all required header fields and sections."""

    REQUIRED_HEADER_FIELDS = [
        "Item:",
        "Titulo:",
        "Fuente:",
        "Rol evaluador:",
        "Fecha:",
        "Base branch:",
        "Head branch:",
        "Archivos tocados:",
        "Checks observados:",
    ]

    REQUIRED_SECTIONS = [
        "## Claim Principal",
        "## Evidencia Revisada",
        "## Puntajes",
        "## Decision Recomendada",
        "## Razon",
        "## Condiciones Para Avanzar",
        "## Comentario Sugerido Para GitHub",
    ]

    def _get_canvas_block(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        blocks = _extract_code_block(content, lang="md")
        # The canvas block is the first md code block and contains "Agent Review Canvas"
        for block in blocks:
            if "Agent Review Canvas" in block:
                return block
        pytest.fail("Could not find the Agent Review Canvas code block")

    def test_canvas_block_exists(self):
        canvas = self._get_canvas_block()
        assert "Agent Review Canvas" in canvas

    @pytest.mark.parametrize("field", REQUIRED_HEADER_FIELDS)
    def test_canvas_has_required_header_field(self, field):
        canvas = self._get_canvas_block()
        assert field in canvas, f"Canvas template missing required field: {field!r}"

    @pytest.mark.parametrize("section", REQUIRED_SECTIONS)
    def test_canvas_has_required_section(self, section):
        canvas = self._get_canvas_block()
        assert section in canvas, f"Canvas template missing required section: {section!r}"

    def test_canvas_puntajes_has_valor_funcional(self):
        canvas = self._get_canvas_block()
        assert "Valor funcional: 1-10" in canvas

    def test_canvas_puntajes_has_calidad_implementacion(self):
        canvas = self._get_canvas_block()
        assert "Calidad de implementacion: 1-10" in canvas

    def test_canvas_puntajes_has_seguridad_aceptar(self):
        canvas = self._get_canvas_block()
        assert "Seguridad al aceptar: 1-10" in canvas

    def test_canvas_puntajes_has_riesgo_regresion(self):
        canvas = self._get_canvas_block()
        assert "Riesgo de regresion: bajo / medio / alto" in canvas

    def test_canvas_puntajes_has_frescura_cambio(self):
        canvas = self._get_canvas_block()
        assert "Frescura del cambio: vigente / stale / duplicado / desconocido" in canvas

    def test_canvas_decision_options(self):
        canvas = self._get_canvas_block()
        assert "merge / modify / rescue / close / investigate" in canvas

    def test_canvas_condiciones_has_checkboxes(self):
        canvas = self._get_canvas_block()
        assert "- [ ] Condicion 1" in canvas
        assert "- [ ] Condicion 2" in canvas

    def test_canvas_rol_evaluador_lists_all_roles(self):
        canvas = self._get_canvas_block()
        roles = ["producto", "ux", "ui", "accesibilidad", "seguridad", "arquitectura", "qa", "docs"]
        for role in roles:
            assert role in canvas, f"Canvas rol evaluador missing role: {role!r}"

    def test_canvas_fuente_lists_expected_sources(self):
        canvas = self._get_canvas_block()
        assert "manual" in canvas
        assert "Jules" in canvas
        assert "Codex" in canvas
        assert "Bolt" in canvas


# ===========================================================================
# Labels
# ===========================================================================


@pytest.mark.unit
class TestLabels:
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

    def _label_block(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        blocks = _extract_code_block(content, lang="txt")
        assert blocks, "No txt code block found for labels"
        # The label block contains agent: prefixed labels
        for block in blocks:
            if "agent:producto" in block:
                return block
        pytest.fail("Could not find the labels txt code block")

    @pytest.mark.parametrize("label", REQUIRED_AGENT_LABELS)
    def test_agent_label_defined(self, label):
        block = self._label_block()
        assert label in block, f"Missing agent label: {label!r}"

    @pytest.mark.parametrize("label", REQUIRED_VALUE_LABELS)
    def test_value_label_defined(self, label):
        block = self._label_block()
        assert label in block, f"Missing value label: {label!r}"

    @pytest.mark.parametrize("label", REQUIRED_DECISION_LABELS)
    def test_decision_label_defined(self, label):
        block = self._label_block()
        assert label in block, f"Missing decision label: {label!r}"

    @pytest.mark.parametrize("label", REQUIRED_REASON_LABELS)
    def test_reason_label_defined(self, label):
        block = self._label_block()
        assert label in block, f"Missing reason label: {label!r}"


# ===========================================================================
# Kanban board
# ===========================================================================


@pytest.mark.unit
class TestKanbanBoard:
    REQUIRED_COLUMNS = [
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

    def _kanban_section(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Tablero Kanban Recomendado\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match, "Could not find Tablero Kanban Recomendado section"
        return match.group(1)

    @pytest.mark.parametrize("column", REQUIRED_COLUMNS)
    def test_kanban_has_column(self, column):
        section = self._kanban_section()
        assert column in section, f"Kanban board missing column: {column!r}"

    def test_kanban_has_eleven_columns(self):
        section = self._kanban_section()
        # Each column is listed as "- ColumnName:"
        columns = re.findall(r"^- ([^:]+):", section, re.MULTILINE)
        assert len(columns) == 11, (
            f"Expected 11 kanban columns, found {len(columns)}: {columns}"
        )


# ===========================================================================
# Quick-close rules
# ===========================================================================


@pytest.mark.unit
class TestQuickCloseRules:
    def _section(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Reglas De Cierre Rapido\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match, "Could not find Reglas De Cierre Rapido section"
        return match.group(1)

    def test_quick_close_has_empty_diff_rule(self):
        assert "Diff vacio" in self._section()

    def test_quick_close_has_validate_failed_rule(self):
        assert "ERROR: validate failed" in self._section()

    def test_quick_close_has_stale_snapshot_rule(self):
        section = self._section()
        assert "stale" in section or "mas nueva" in section

    def test_quick_close_has_duplicate_rule(self):
        assert "duplicada" in self._section()

    def test_quick_close_has_future_date_rule(self):
        assert "fecha futura" in self._section()

    def test_quick_close_has_micro_optimization_rule(self):
        assert "micro-optimizacion" in self._section()

    def test_quick_close_has_dependency_without_justification_rule(self):
        assert "dependencias sin justificacion" in self._section()

    def test_quick_close_has_seven_rules(self):
        section = self._section()
        bullet_items = re.findall(r"^- ", section, re.MULTILINE)
        assert len(bullet_items) == 7, (
            f"Expected 7 quick-close rules, found {len(bullet_items)}"
        )

    def test_quick_close_mentions_decision_close_label(self):
        assert "decision:close" in self._section()


# ===========================================================================
# Rescue rules
# ===========================================================================


@pytest.mark.unit
class TestRescueRules:
    def _section(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Reglas De Rescate\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match, "Could not find Reglas De Rescate section"
        return match.group(1)

    def test_rescue_rule_good_idea_bad_execution(self):
        assert "idea es buena" in self._section()

    def test_rescue_rule_stale_conflicting(self):
        assert "stale" in self._section() or "conflictiva" in self._section()

    def test_rescue_rule_mixed_issues(self):
        assert "mezcla" in self._section()

    def test_rescue_rule_automation_edited_docs(self):
        assert "automatizacion" in self._section()

    def test_rescue_rule_mentions_decision_rescue_label(self):
        assert "decision:rescue" in self._section()

    def test_rescue_produces_minimal_patch(self):
        assert "patch minimo" in self._section()


# ===========================================================================
# Agent profiles
# ===========================================================================


EXPECTED_PROFILES = [
    "Producto",
    "UX",
    "UI Visual",
    "Accesibilidad",
    "Seguridad",
    "Arquitectura E Ingenieria",
    "QA Y CI",
    "Documentacion Y Knowledge Base",
]


@pytest.mark.unit
class TestAgentProfiles:
    def test_eight_profiles_defined(self):
        content = _read(AGENT_HIVE_FILE)
        profiles = re.findall(r"^## Perfil: (.+)$", content, re.MULTILINE)
        assert len(profiles) == 8, (
            f"Expected 8 agent profiles, found {len(profiles)}: {profiles}"
        )

    @pytest.mark.parametrize("profile", EXPECTED_PROFILES)
    def test_profile_section_exists(self, profile):
        content = _read(AGENT_HIVE_FILE)
        assert f"## Perfil: {profile}" in content, (
            f"Missing profile section: 'Perfil: {profile}'"
        )

    @pytest.mark.parametrize("profile", EXPECTED_PROFILES)
    def test_profile_has_proposito_subsection(self, profile):
        content = _read(AGENT_HIVE_FILE)
        # Find the profile section and look for ### Proposito within it
        pattern = rf"## Perfil: {re.escape(profile)}\n(.*?)(?=\n## )"
        match = re.search(pattern, content, re.DOTALL)
        assert match, f"Could not extract section for profile: {profile}"
        section = match.group(1)
        assert "### Proposito" in section, (
            f"Profile '{profile}' is missing ### Proposito subsection"
        )

    @pytest.mark.parametrize("profile", EXPECTED_PROFILES)
    def test_profile_has_debe_revisar_subsection(self, profile):
        content = _read(AGENT_HIVE_FILE)
        pattern = rf"## Perfil: {re.escape(profile)}\n(.*?)(?=\n## )"
        match = re.search(pattern, content, re.DOTALL)
        assert match, f"Could not extract section for profile: {profile}"
        section = match.group(1)
        assert "### Debe Revisar" in section, (
            f"Profile '{profile}' is missing ### Debe Revisar subsection"
        )

    @pytest.mark.parametrize("profile", EXPECTED_PROFILES)
    def test_profile_has_prompt_subsection(self, profile):
        content = _read(AGENT_HIVE_FILE)
        pattern = rf"## Perfil: {re.escape(profile)}\n(.*?)(?=\n## )"
        match = re.search(pattern, content, re.DOTALL)
        assert match, f"Could not extract section for profile: {profile}"
        section = match.group(1)
        assert "### Prompt" in section, (
            f"Profile '{profile}' is missing ### Prompt subsection"
        )

    @pytest.mark.parametrize("profile", EXPECTED_PROFILES)
    def test_profile_prompt_ends_with_canvas_delivery_instruction(self, profile):
        """Each profile prompt must instruct the agent to deliver the canvas."""
        content = _read(AGENT_HIVE_FILE)
        pattern = rf"## Perfil: {re.escape(profile)}\n(.*?)(?=\n## )"
        match = re.search(pattern, content, re.DOTALL)
        assert match, f"Could not extract section for profile: {profile}"
        section = match.group(1)
        assert "Entrega solo el Agent Review Canvas completo" in section, (
            f"Profile '{profile}' prompt must end with delivery instruction"
        )

    @pytest.mark.parametrize("profile", EXPECTED_PROFILES)
    def test_profile_prompt_has_rules_block(self, profile):
        """Each profile prompt must have a Reglas: block."""
        content = _read(AGENT_HIVE_FILE)
        pattern = rf"## Perfil: {re.escape(profile)}\n(.*?)(?=\n## )"
        match = re.search(pattern, content, re.DOTALL)
        assert match, f"Could not extract section for profile: {profile}"
        section = match.group(1)
        assert "Reglas:" in section, (
            f"Profile '{profile}' prompt missing 'Reglas:' block"
        )


# ===========================================================================
# Specific profile content tests
# ===========================================================================


@pytest.mark.unit
class TestProductoProfile:
    def _section(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Perfil: Producto\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match
        return match.group(1)

    def test_producto_mentions_checkout(self):
        assert "checkout" in self._section()

    def test_producto_mentions_pagos(self):
        assert "pagos" in self._section()

    def test_producto_mentions_rescue_recommendation(self):
        assert "rescue" in self._section()


@pytest.mark.unit
class TestSegurityProfile:
    def _section(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Perfil: Seguridad\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match
        return match.group(1)

    def test_security_checks_auth(self):
        assert "Auth" in self._section() or "auth" in self._section()

    def test_security_checks_secrets(self):
        assert "secretos" in self._section() or "secret" in self._section()

    def test_security_checks_payments(self):
        assert "pagos" in self._section() or "Pagos" in self._section()

    def test_security_checks_pii(self):
        assert "PII" in self._section() or "datos personales" in self._section()

    def test_security_reviews_dependencies(self):
        assert "dependencias" in self._section()

    def test_security_checks_mass_assignment(self):
        assert "Mass assignment" in self._section()

    def test_security_checks_webhooks(self):
        assert "webhooks" in self._section()


@pytest.mark.unit
class TestAccesibilidadProfile:
    def _section(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Perfil: Accesibilidad\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match
        return match.group(1)

    def test_accessibility_mentions_accessibility_role(self):
        assert "accessibilityRole" in self._section()

    def test_accessibility_mentions_accessibility_label(self):
        assert "accessibilityLabel" in self._section()

    def test_accessibility_mentions_voiceover_talkback(self):
        section = self._section()
        assert "VoiceOver" in section or "TalkBack" in section

    def test_accessibility_mentions_rntl_tests(self):
        assert "React Native Testing Library" in self._section()

    def test_accessibility_mentions_hit_slop(self):
        assert "hitSlop" in self._section()


@pytest.mark.unit
class TestArquitecturaProfile:
    def _section(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Perfil: Arquitectura E Ingenieria\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match
        return match.group(1)

    def test_architecture_mentions_backend_routers(self):
        assert "routers" in self._section()

    def test_architecture_mentions_services(self):
        assert "services" in self._section()

    def test_architecture_mentions_zustand(self):
        assert "Zustand" in self._section()

    def test_architecture_no_any_in_typescript(self):
        assert "any" in self._section()

    def test_architecture_frontend_api_location(self):
        assert "frontend/api/" in self._section()


# ===========================================================================
# Triage and Synthesizer prompts
# ===========================================================================


@pytest.mark.unit
class TestTriagePrompt:
    def _triage_block(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Prompt Maestro Para Triage Inicial\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match, "Could not find Prompt Maestro Para Triage Inicial section"
        return match.group(1)

    def test_triage_prompt_exists_as_code_block(self):
        section = self._triage_block()
        assert "```md" in section

    def test_triage_prompt_identifies_agent_as_triage(self):
        section = self._triage_block()
        assert "Triage Agent" in section

    def test_triage_prompt_outputs_tipo_probable(self):
        section = self._triage_block()
        assert "Tipo probable" in section

    def test_triage_prompt_outputs_perfiles_requeridos(self):
        section = self._triage_block()
        assert "Perfiles requeridos" in section

    def test_triage_prompt_lists_kanban_column(self):
        section = self._triage_block()
        assert "Siguiente columna kanban" in section

    def test_triage_prompt_outputs_priority(self):
        section = self._triage_block()
        assert "Prioridad" in section

    def test_triage_prompt_security_always_required_for_sensitive(self):
        section = self._triage_block()
        assert "pagos/auth/permisos" in section

    def test_triage_prompt_has_quick_close_signals(self):
        section = self._triage_block()
        assert "Senales de cierre rapido" in section


@pytest.mark.unit
class TestDecisionSynthesizerPrompt:
    def _synthesizer_block(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Prompt Para Consolidar Decisiones\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match, "Could not find Prompt Para Consolidar Decisiones section"
        return match.group(1)

    def test_synthesizer_prompt_exists_as_code_block(self):
        section = self._synthesizer_block()
        assert "```md" in section

    def test_synthesizer_prompt_identifies_as_decision_synthesizer(self):
        section = self._synthesizer_block()
        assert "Decision Synthesizer" in section

    def test_synthesizer_outputs_final_decision(self):
        section = self._synthesizer_block()
        assert "Decision final" in section

    def test_synthesizer_outputs_final_score(self):
        section = self._synthesizer_block()
        assert "Score final" in section

    def test_synthesizer_outputs_github_comment(self):
        section = self._synthesizer_block()
        assert "Comentario final para GitHub" in section

    def test_synthesizer_outputs_labels(self):
        section = self._synthesizer_block()
        assert "Labels recomendados" in section

    def test_synthesizer_outputs_kanban_column(self):
        section = self._synthesizer_block()
        assert "Columna kanban" in section

    def test_synthesizer_security_blocks_merge(self):
        """If security marks high risk, direct merge must be blocked."""
        section = self._synthesizer_block()
        assert "Seguridad marca riesgo alto" in section
        assert "no puedes recomendar merge directo" in section

    def test_synthesizer_qa_insufficient_blocks_merge(self):
        """If QA marks checks insufficient, direct merge must be blocked."""
        section = self._synthesizer_block()
        assert "QA marca checks insuficientes" in section

    def test_synthesizer_low_product_value_closes(self):
        section = self._synthesizer_block()
        assert "valor 0-2" in section

    def test_synthesizer_good_idea_bad_pr_rescues(self):
        section = self._synthesizer_block()
        assert "rescue" in section

    def test_synthesizer_contradictions_trigger_investigate(self):
        section = self._synthesizer_block()
        assert "investigate" in section


# ===========================================================================
# Usage examples
# ===========================================================================


@pytest.mark.unit
class TestUsageExamples:
    def _section(self) -> str:
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Ejemplo De Uso Sobre PRs Automatizadas\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match, "Could not find Ejemplo De Uso section"
        return match.group(1)

    def test_examples_section_has_three_examples(self):
        section = self._section()
        blocks = _extract_code_block(section, lang="md")
        assert len(blocks) == 3, f"Expected 3 usage examples, found {len(blocks)}"

    def test_validate_failed_example_closes(self):
        section = self._section()
        assert "validate failed" in section
        assert "Decision: close" in section

    def test_validate_failed_example_has_labels(self):
        section = self._section()
        assert "decision:close" in section
        assert "reason:validate-failed" in section
        assert "value:none" in section

    def test_duplicate_pr_example_present(self):
        section = self._section()
        assert "Bolt useShallow" in section or "duplicate" in section or "reason:duplicate" in section

    def test_accessibility_pr_example_merges(self):
        section = self._section()
        assert "accessibility labels" in section or "Decision: merge" in section

    def test_accessibility_pr_example_has_high_value(self):
        section = self._section()
        assert "value:high" in section


# ===========================================================================
# Cadence and definition of done
# ===========================================================================


@pytest.mark.unit
class TestCadenceAndDefinitionOfDone:
    def test_daily_cadence_defined(self):
        content = _read(AGENT_HIVE_FILE)
        assert "Diario:" in content

    def test_weekly_cadence_defined(self):
        content = _read(AGENT_HIVE_FILE)
        assert "Semanal:" in content

    def test_daily_cadence_has_triage_step(self):
        content = _read(AGENT_HIVE_FILE)
        assert "Triage Agent clasifica" in content

    def test_daily_cadence_has_synthesizer_step(self):
        content = _read(AGENT_HIVE_FILE)
        assert "Decision Synthesizer" in content

    def test_definition_of_done_security_not_merged_without_review(self):
        content = _read(AGENT_HIVE_FILE)
        assert "cambios de seguridad no se mergean sin revision especifica" in content

    def test_definition_of_done_valuable_prs_have_conditions(self):
        content = _read(AGENT_HIVE_FILE)
        assert "PRs valiosas tienen condiciones claras" in content

    def test_definition_of_done_useful_ideas_rescued(self):
        content = _read(AGENT_HIVE_FILE)
        assert "rescatan como patches limpios" in content

    def test_definition_of_done_ux_ui_accessibility_separate_evidence(self):
        content = _read(AGENT_HIVE_FILE)
        assert "UX, UI y accesibilidad dejan evidencia separada" in content


# ===========================================================================
# Regression / boundary / negative tests
# ===========================================================================


@pytest.mark.unit
class TestRegressionAndBoundary:
    def test_file_does_not_contain_future_dates_as_metrics(self):
        """The doc must not claim future dates as 'Ultima actualizacion'."""
        content = _read(AGENT_HIVE_FILE)
        # The file should not contain date stamps with years beyond 2030
        future_year_pattern = re.compile(r"\b20[3-9]\d\b")
        matches = future_year_pattern.findall(content)
        assert not matches, (
            f"File contains potentially future year references: {matches}"
        )

    def test_file_does_not_expose_secrets_or_tokens(self):
        """No hardcoded secrets, tokens, passwords, or API keys should be present."""
        content = _read(AGENT_HIVE_FILE)
        secret_patterns = [
            r"(?i)api[_\-]?key\s*=\s*['\"][^'\"]{10,}",
            r"(?i)secret\s*=\s*['\"][^'\"]{10,}",
            r"(?i)password\s*=\s*['\"][^'\"]{6,}",
            r"(?i)token\s*=\s*['\"][^'\"]{10,}",
        ]
        for pattern in secret_patterns:
            assert not re.search(pattern, content), (
                f"Potential secret exposure found matching pattern: {pattern!r}"
            )

    def test_all_decision_values_cover_five_options(self):
        """Decisions must always be one of exactly five options."""
        content = _read(AGENT_HIVE_FILE)
        # The five canonical decisions must appear throughout
        for decision in ["merge", "modify", "rescue", "close", "investigate"]:
            assert decision in content, f"Decision option missing from file: {decision!r}"

    def test_no_raw_html_injections(self):
        """Markdown file should not contain unexpected raw HTML script tags."""
        content = _read(AGENT_HIVE_FILE)
        assert "<script" not in content.lower()
        assert "javascript:" not in content.lower()

    def test_readme_ia_tools_section_is_after_frontend_section(self):
        """ia-tools section in README must appear after the frontend section."""
        content = _read(DOCS_README)
        frontend_pos = content.find("[frontend/](./frontend/)")
        ia_tools_pos = content.find("[ia-tools/](./ia-tools/)")
        assert frontend_pos != -1, "frontend section not found in README"
        assert ia_tools_pos != -1, "ia-tools section not found in README"
        assert ia_tools_pos > frontend_pos, (
            "ia-tools section must appear after the frontend section in README"
        )

    def test_canvas_decision_list_is_complete_and_lowercase(self):
        """Decision options in canvas must be lowercase and complete."""
        content = _read(AGENT_HIVE_FILE)
        blocks = _extract_code_block(content, lang="md")
        canvas = next(b for b in blocks if "Agent Review Canvas" in b)
        decision_line = next(
            (line for line in canvas.splitlines() if "merge / modify / rescue" in line),
            None
        )
        assert decision_line is not None, "Canvas decision line not found"
        assert decision_line == decision_line.lower(), (
            f"Decision options must be lowercase, got: {decision_line!r}"
        )

    def test_no_profile_missing_all_three_subsections(self):
        """Each profile must have Proposito, Debe Revisar, and Prompt — none can be skipped."""
        content = _read(AGENT_HIVE_FILE)
        profile_blocks = re.split(r"\n## Perfil: ", content)
        # Skip the first item (content before first profile)
        for block in profile_blocks[1:]:
            profile_name = block.split("\n")[0]
            for subsection in ("### Proposito", "### Debe Revisar", "### Prompt"):
                assert subsection in block, (
                    f"Profile '{profile_name}' is missing subsection {subsection!r}"
                )

    def test_agent_hive_file_has_no_trailing_null_bytes(self):
        raw_bytes = AGENT_HIVE_FILE.read_bytes()
        assert b"\x00" not in raw_bytes, "File contains null bytes"


# ===========================================================================
# CR Dependencias 2026-05-18 — Active Items Section (added in this PR)
# ===========================================================================


@pytest.mark.unit
class TestCRDependenciasSection:
    """Tests for the new '### Items Activos: CR Dependencias 2026-05-18' subsection
    added under ## Tablero Kanban Recomendado."""

    def _kanban_section(self) -> str:
        """Extract the full Tablero Kanban Recomendado section."""
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"## Tablero Kanban Recomendado\n(.*?)(?=\n## )", content, re.DOTALL
        )
        assert match, "Could not find Tablero Kanban Recomendado section"
        return match.group(1)

    def _cr_section(self) -> str:
        """Extract content starting from the CR Dependencias subsection heading."""
        content = _read(AGENT_HIVE_FILE)
        match = re.search(
            r"### Items Activos: CR Dependencias 2026-05-18\s*(.*?)(?=\nLabels sugeridos:|\Z)",
            content,
            re.DOTALL,
        )
        assert match, "Could not find '### Items Activos: CR Dependencias 2026-05-18' section"
        return match.group(1)

    def _cr_prompt_block(self) -> str:
        """Extract the ```md agent prompt block from the CR section."""
        cr_text = self._cr_section()
        blocks = _extract_code_block(cr_text, lang="md")
        assert blocks, "No ```md code block found in CR Dependencias section"
        # Return the first block — the dependency CR agent prompt
        return blocks[0]

    # -----------------------------------------------------------------------
    # Section heading and placement
    # -----------------------------------------------------------------------

    def test_cr_section_heading_exists_in_kanban_section(self):
        section = self._kanban_section()
        assert "### Items Activos: CR Dependencias 2026-05-18" in section, (
            "Subsection '### Items Activos: CR Dependencias 2026-05-18' must be inside "
            "the Tablero Kanban Recomendado section"
        )

    def test_cr_section_appears_before_labels_sugeridos(self):
        content = _read(AGENT_HIVE_FILE)
        cr_pos = content.find("### Items Activos: CR Dependencias 2026-05-18")
        labels_pos = content.find("Labels sugeridos:")
        assert cr_pos != -1, "CR section heading not found"
        assert labels_pos != -1, "Labels sugeridos section not found"
        assert cr_pos < labels_pos, (
            "CR Dependencias section must appear before the 'Labels sugeridos:' block"
        )

    def test_cr_section_appears_after_kanban_column_list(self):
        content = _read(AGENT_HIVE_FILE)
        merged_col_pos = content.find("- Merged: integrada.")
        cr_pos = content.find("### Items Activos: CR Dependencias 2026-05-18")
        assert merged_col_pos != -1, "Merged column description not found"
        assert cr_pos != -1, "CR section heading not found"
        assert cr_pos > merged_col_pos, (
            "CR Dependencias section must come after the kanban columns list"
        )

    # -----------------------------------------------------------------------
    # Introductory paragraph
    # -----------------------------------------------------------------------

    def test_cr_intro_mentions_dependabot(self):
        cr_text = self._cr_section()
        assert "Dependabot" in cr_text, (
            "CR section intro must reference Dependabot as origin of these PRs"
        )

    def test_cr_intro_mentions_ci_block(self):
        cr_text = self._cr_section()
        assert "CI" in cr_text, (
            "CR section intro must mention the CI block"
        )

    def test_cr_intro_prohibits_direct_merge_while_ci_red(self):
        cr_text = self._cr_section()
        assert "mergearse directo" in cr_text or "no deben" in cr_text, (
            "CR section must warn against direct merging while CI is failing"
        )

    def test_cr_intro_names_p2_deprecations_check(self):
        cr_text = self._cr_section()
        assert "P2 deprecations" in cr_text, (
            "CR section must name the 'P2 deprecations' guard that is causing the block"
        )

    def test_cr_intro_names_no_net_increase_check(self):
        cr_text = self._cr_section()
        assert "no-net-increase check" in cr_text, (
            "CR section must reference the 'no-net-increase check' by name"
        )

    def test_cr_intro_names_backend_tests(self):
        cr_text = self._cr_section()
        assert "Backend Tests" in cr_text, (
            "CR section must mention that the failing job is 'Backend Tests'"
        )

    # -----------------------------------------------------------------------
    # Active items table structure
    # -----------------------------------------------------------------------

    def test_cr_table_has_id_column(self):
        cr_text = self._cr_section()
        assert "| ID |" in cr_text or "| ID " in cr_text, (
            "CR Dependencias table must have an 'ID' column"
        )

    def test_cr_table_has_pr_column(self):
        cr_text = self._cr_section()
        assert "| PR |" in cr_text or "| PR " in cr_text, (
            "CR Dependencias table must have a 'PR' column"
        )

    def test_cr_table_has_columna_column(self):
        cr_text = self._cr_section()
        assert "Columna" in cr_text, (
            "CR Dependencias table must have a 'Columna' column"
        )

    def test_cr_table_has_roles_asignados_column(self):
        cr_text = self._cr_section()
        assert "Roles asignados" in cr_text, (
            "CR Dependencias table must have a 'Roles asignados' column"
        )

    def test_cr_table_has_seguridad_column(self):
        cr_text = self._cr_section()
        assert "Seguridad" in cr_text, (
            "CR Dependencias table must include a 'Seguridad' score column"
        )

    def test_cr_table_has_calidad_column(self):
        cr_text = self._cr_section()
        assert "Calidad" in cr_text, (
            "CR Dependencias table must include a 'Calidad' score column"
        )

    def test_cr_table_has_funcionalidad_column(self):
        cr_text = self._cr_section()
        assert "Funcionalidad" in cr_text, (
            "CR Dependencias table must include a 'Funcionalidad' score column"
        )

    def test_cr_table_has_bloqueo_column(self):
        cr_text = self._cr_section()
        assert "Bloqueo" in cr_text, (
            "CR Dependencias table must include a 'Bloqueo' column"
        )

    def test_cr_table_has_separator_row(self):
        """The table must have a proper markdown separator (|---|...) row."""
        cr_text = self._cr_section()
        assert re.search(r"\|\s*---\s*\|", cr_text), (
            "CR Dependencias table must have a markdown separator row '| --- |'"
        )

    # -----------------------------------------------------------------------
    # CR-DEP-2026-05-18-01: brace-expansion
    # -----------------------------------------------------------------------

    def test_cr_item_01_id_present(self):
        cr_text = self._cr_section()
        assert "CR-DEP-2026-05-18-01" in cr_text, (
            "Table must contain item CR-DEP-2026-05-18-01"
        )

    def test_cr_item_01_references_pr_220(self):
        cr_text = self._cr_section()
        assert "#220" in cr_text, (
            "CR-DEP-2026-05-18-01 must reference PR #220"
        )

    def test_cr_item_01_package_is_brace_expansion(self):
        cr_text = self._cr_section()
        assert "brace-expansion" in cr_text, (
            "CR-DEP-2026-05-18-01 must identify the updated package as 'brace-expansion'"
        )

    def test_cr_item_01_version_bump_present(self):
        cr_text = self._cr_section()
        assert "5.0.5" in cr_text and "5.0.6" in cr_text, (
            "CR-DEP-2026-05-18-01 must show the version bump from 5.0.5 to 5.0.6"
        )

    def test_cr_item_01_column_is_needs_changes(self):
        cr_text = self._cr_section()
        # Find the row containing CR-DEP-2026-05-18-01
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-01.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-01"
        assert "Needs Changes" in row_match.group(0), (
            "CR-DEP-2026-05-18-01 must have 'Needs Changes' as its Columna value"
        )

    def test_cr_item_01_has_security_agent_assigned(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-01.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-01"
        assert "agent:security" in row_match.group(0), (
            "CR-DEP-2026-05-18-01 must have agent:security assigned"
        )

    def test_cr_item_01_has_architecture_agent_assigned(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-01.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-01"
        assert "agent:architecture" in row_match.group(0), (
            "CR-DEP-2026-05-18-01 must have agent:architecture assigned"
        )

    def test_cr_item_01_has_qa_agent_assigned(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-01.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-01"
        assert "agent:qa" in row_match.group(0), (
            "CR-DEP-2026-05-18-01 must have agent:qa assigned"
        )

    def test_cr_item_01_security_score(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-01.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-01"
        assert "8/10" in row_match.group(0), (
            "CR-DEP-2026-05-18-01 must have a security score of 8/10"
        )

    def test_cr_item_01_bloqueo_mentions_pnpm_lock(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-01.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-01"
        assert "pnpm-lock.yaml" in row_match.group(0), (
            "CR-DEP-2026-05-18-01 bloqueo must mention 'pnpm-lock.yaml'"
        )

    def test_cr_item_01_bloqueo_mentions_deprecated_count_increase(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-01.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-01"
        row = row_match.group(0)
        assert "12" in row and "14" in row, (
            "CR-DEP-2026-05-18-01 bloqueo must show deprecated count increase from 12 to 14"
        )

    # -----------------------------------------------------------------------
    # CR-DEP-2026-05-18-02: postcss
    # -----------------------------------------------------------------------

    def test_cr_item_02_id_present(self):
        cr_text = self._cr_section()
        assert "CR-DEP-2026-05-18-02" in cr_text, (
            "Table must contain item CR-DEP-2026-05-18-02"
        )

    def test_cr_item_02_references_pr_222(self):
        cr_text = self._cr_section()
        assert "#222" in cr_text, (
            "CR-DEP-2026-05-18-02 must reference PR #222"
        )

    def test_cr_item_02_package_is_postcss(self):
        cr_text = self._cr_section()
        assert "postcss" in cr_text, (
            "CR-DEP-2026-05-18-02 must identify the updated package as 'postcss'"
        )

    def test_cr_item_02_version_present(self):
        cr_text = self._cr_section()
        assert "8.5.14" in cr_text, (
            "CR-DEP-2026-05-18-02 must include the version 8.5.14"
        )

    def test_cr_item_02_column_is_needs_changes(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-02.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-02"
        assert "Needs Changes" in row_match.group(0), (
            "CR-DEP-2026-05-18-02 must have 'Needs Changes' as its Columna value"
        )

    def test_cr_item_02_security_score_is_fractional(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-02.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-02"
        assert "8.5/10" in row_match.group(0), (
            "CR-DEP-2026-05-18-02 must have security score of 8.5/10"
        )

    def test_cr_item_02_mentions_expo_tailwind_nativewind_compatibility(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-02.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-02"
        row = row_match.group(0)
        assert "Expo" in row or "Tailwind" in row or "NativeWind" in row, (
            "CR-DEP-2026-05-18-02 bloqueo must mention Expo/Tailwind/NativeWind compatibility"
        )

    def test_cr_item_02_bloqueo_mentions_same_p2_block(self):
        cr_text = self._cr_section()
        row_match = re.search(r"\|.*CR-DEP-2026-05-18-02.*\|", cr_text)
        assert row_match, "Could not find table row for CR-DEP-2026-05-18-02"
        assert "P2" in row_match.group(0) or "CI" in row_match.group(0), (
            "CR-DEP-2026-05-18-02 bloqueo must mention the P2 CI block"
        )

    # -----------------------------------------------------------------------
    # Conditions to reach Ready To Merge
    # -----------------------------------------------------------------------

    def test_conditions_heading_present(self):
        cr_text = self._cr_section()
        assert "Condiciones para mover a" in cr_text, (
            "CR section must list conditions for moving items to 'Ready To Merge'"
        )

    def test_conditions_target_ready_to_merge(self):
        cr_text = self._cr_section()
        assert "Ready To Merge" in cr_text, (
            "Conditions heading must reference the 'Ready To Merge' kanban column"
        )

    def test_conditions_has_five_items(self):
        cr_text = self._cr_section()
        # Extract content between "Condiciones para mover" and the prompt block
        match = re.search(
            r"Condiciones para mover.*?:(.*?)Prompt para agentes",
            cr_text,
            re.DOTALL,
        )
        assert match, "Could not extract the conditions list"
        conditions_text = match.group(1)
        numbered = re.findall(r"^\d+\.", conditions_text, re.MULTILINE)
        assert len(numbered) == 5, (
            f"Expected exactly 5 conditions to reach 'Ready To Merge', found {len(numbered)}"
        )

    def test_condition_1_resolve_p2_guard(self):
        cr_text = self._cr_section()
        assert "Resolver la politica del guard" in cr_text or "guard" in cr_text, (
            "Condition 1 must address resolving the P2 deprecations guard"
        )

    def test_condition_2_baseline_update(self):
        cr_text = self._cr_section()
        assert "baseline" in cr_text, (
            "Condition 2 must address updating the baseline with justification"
        )

    def test_condition_3_new_deprecations_handling(self):
        cr_text = self._cr_section()
        assert "alternativa de version" in cr_text or "remediation" in cr_text, (
            "Condition 3 must address handling new deprecations via version alternative or remediation"
        )

    def test_condition_4_ci_rerun_specified(self):
        cr_text = self._cr_section()
        assert "Re-ejecutar CI" in cr_text, (
            "Condition 4 must require re-running CI and confirming all checks pass"
        )

    def test_condition_4_lists_required_checks(self):
        cr_text = self._cr_section()
        # Condition 4 should list specific CI checks
        for check in ("backend tests", "frontend", "dependency audit", "SAST", "secret scan"):
            assert check.lower() in cr_text.lower(), (
                f"Condition 4 must mention CI check: {check!r}"
            )

    def test_condition_5_pr_comment_required(self):
        cr_text = self._cr_section()
        assert "comentario final" in cr_text or "Dejar comentario" in cr_text, (
            "Condition 5 must require a final comment on each PR with decision and evidence"
        )

    def test_condition_5_comment_includes_riesgo_residual(self):
        cr_text = self._cr_section()
        assert "riesgo residual" in cr_text, (
            "Condition 5 must require the comment to include residual risk (riesgo residual)"
        )

    # -----------------------------------------------------------------------
    # Agent prompt block
    # -----------------------------------------------------------------------

    def test_cr_agent_prompt_block_exists(self):
        block = self._cr_prompt_block()
        assert len(block.strip()) > 0, "The CR agent prompt block must not be empty"

    def test_cr_agent_prompt_identifies_as_healthbytes_agent(self):
        block = self._cr_prompt_block()
        assert "HealthBytes" in block, (
            "CR agent prompt must identify the agent as belonging to HealthBytes"
        )

    def test_cr_agent_prompt_identifies_as_dependency_cr(self):
        block = self._cr_prompt_block()
        assert "CR de dependencias" in block, (
            "CR agent prompt must state it is assigned to the 'CR de dependencias'"
        )

    def test_cr_agent_prompt_references_both_cr_item_ids(self):
        block = self._cr_prompt_block()
        assert "CR-DEP-2026-05-18-01" in block and "CR-DEP-2026-05-18-02" in block, (
            "CR agent prompt must reference both CR item IDs"
        )

    def test_cr_agent_prompt_references_prs_220_and_222(self):
        block = self._cr_prompt_block()
        assert "#220" in block and "#222" in block, (
            "CR agent prompt must reference both related PRs (#220 and #222)"
        )

    def test_cr_agent_prompt_initial_state_is_needs_changes(self):
        block = self._cr_prompt_block()
        assert "Needs Changes" in block, (
            "CR agent prompt must state the initial state is 'Needs Changes'"
        )

    def test_cr_agent_prompt_names_blocking_condition(self):
        block = self._cr_prompt_block()
        assert "P2 deprecations" in block, (
            "CR agent prompt must name the blocking condition: P2 deprecations"
        )

    def test_cr_agent_prompt_names_ci_red_block(self):
        block = self._cr_prompt_block()
        assert "CI rojo" in block or "CI red" in block.lower(), (
            "CR agent prompt must mention that CI is red as the known block"
        )

    def test_cr_agent_prompt_has_tarea_section(self):
        block = self._cr_prompt_block()
        assert "Tu tarea" in block or "tarea:" in block.lower(), (
            "CR agent prompt must include a 'Tu tarea' section"
        )

    def test_cr_agent_prompt_tarea_instructs_security_review(self):
        block = self._cr_prompt_block()
        assert "seguridad real" in block or "aporta seguridad" in block, (
            "CR agent prompt tarea must instruct checking if the bump provides real security value"
        )

    def test_cr_agent_prompt_tarea_instructs_risk_separation(self):
        block = self._cr_prompt_block()
        assert "riesgo del paquete" in block or "deuda revelada" in block, (
            "CR agent prompt tarea must instruct separating package risk from revealed lockfile debt"
        )

    def test_cr_agent_prompt_tarea_instructs_minimal_action(self):
        block = self._cr_prompt_block()
        assert "menor accion correcta" in block or "minima" in block.lower(), (
            "CR agent prompt tarea must instruct proposing the minimal correct action"
        )

    def test_cr_agent_prompt_prohibits_merge_with_red_ci(self):
        block = self._cr_prompt_block()
        assert "No recomendar merge" in block or "no recomendar merge" in block.lower(), (
            "CR agent prompt must explicitly prohibit recommending merge when CI is red"
        )

    def test_cr_agent_prompt_has_entrega_section(self):
        block = self._cr_prompt_block()
        assert "Entrega:" in block or "Entrega\n" in block, (
            "CR agent prompt must include an 'Entrega:' (delivery) section"
        )

    def test_cr_agent_prompt_entrega_requires_canvas(self):
        block = self._cr_prompt_block()
        assert "Agent Review Canvas" in block, (
            "CR agent prompt Entrega must require the Agent Review Canvas"
        )

    def test_cr_agent_prompt_entrega_requires_decision(self):
        block = self._cr_prompt_block()
        assert "Decision:" in block, (
            "CR agent prompt Entrega must include a 'Decision:' field"
        )

    def test_cr_agent_prompt_decision_options_are_modify_rescue_merge(self):
        block = self._cr_prompt_block()
        assert "modify" in block and "rescue" in block and "merge" in block, (
            "CR agent prompt decision options must include: modify, rescue, merge"
        )

    def test_cr_agent_prompt_entrega_requires_patch_or_instructions(self):
        block = self._cr_prompt_block()
        assert "Patch sugerido" in block or "instrucciones exactas" in block, (
            "CR agent prompt Entrega must require a suggested patch or exact instructions"
        )

    def test_cr_agent_prompt_entrega_requires_checks_list(self):
        block = self._cr_prompt_block()
        assert "Checks" in block and "correr" in block, (
            "CR agent prompt Entrega must specify which checks must run before merge"
        )

    def test_cr_agent_prompt_is_fenced_md_block(self):
        cr_text = self._cr_section()
        assert "```md" in cr_text, (
            "The CR agent prompt must be enclosed in a ```md fenced code block"
        )

    # -----------------------------------------------------------------------
    # Table integrity and regression
    # -----------------------------------------------------------------------

    def test_cr_table_has_exactly_two_data_rows(self):
        cr_text = self._cr_section()
        # Data rows contain CR-DEP IDs
        data_rows = re.findall(r"\|\s*CR-DEP-2026-05-18-\d{2}\s*\|", cr_text)
        assert len(data_rows) == 2, (
            f"CR Dependencias table must have exactly 2 data rows, found {len(data_rows)}"
        )

    def test_cr_table_rows_use_pipe_delimiter(self):
        cr_text = self._cr_section()
        # Table rows must start with "| CR-DEP" (excludes prompt-block references)
        table_lines = [
            ln for ln in cr_text.splitlines()
            if ln.strip().startswith("| CR-DEP-2026-05-18")
        ]
        assert len(table_lines) == 2, (
            f"Expected exactly 2 pipe-delimited table rows starting with '| CR-DEP-2026-05-18', "
            f"found {len(table_lines)}"
        )
        for line in table_lines:
            stripped = line.strip()
            assert stripped.startswith("|") and stripped.endswith("|"), (
                f"Table row must be pipe-delimited: {stripped!r}"
            )

    def test_both_cr_items_have_same_column_needs_changes(self):
        cr_text = self._cr_section()
        for item_id in ("CR-DEP-2026-05-18-01", "CR-DEP-2026-05-18-02"):
            row_match = re.search(rf"\|.*{re.escape(item_id)}.*\|", cr_text)
            assert row_match, f"Could not find table row for {item_id}"
            assert "Needs Changes" in row_match.group(0), (
                f"{item_id} must show 'Needs Changes' column status"
            )

    def test_both_cr_items_have_three_agents_assigned(self):
        cr_text = self._cr_section()
        for item_id in ("CR-DEP-2026-05-18-01", "CR-DEP-2026-05-18-02"):
            row_match = re.search(rf"\|.*{re.escape(item_id)}.*\|", cr_text)
            assert row_match, f"Could not find table row for {item_id}"
            row = row_match.group(0)
            for agent in ("agent:security", "agent:architecture", "agent:qa"):
                assert agent in row, (
                    f"{item_id} must have {agent!r} in the Roles asignados column"
                )

    def test_date_in_section_heading_is_not_future_beyond_2030(self):
        cr_text = self._cr_section()
        future_years = re.findall(r"\b20[3-9]\d\b", cr_text)
        assert not future_years, (
            f"CR section must not contain year references beyond 2029: {future_years}"
        )

    def test_cr_section_does_not_contain_placeholder_text(self):
        cr_text = self._cr_section()
        for placeholder in ("TODO", "FIXME", "PLACEHOLDER", "TBD"):
            assert placeholder not in cr_text, (
                f"CR section must not contain placeholder text: {placeholder!r}"
            )
