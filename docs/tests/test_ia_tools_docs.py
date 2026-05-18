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
