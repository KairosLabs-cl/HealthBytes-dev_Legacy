#!/bin/bash
# Script para generar PDF del reporte semanal sin problemas de emojis

REPORT_FILE="$1"
OUTPUT_PDF="${REPORT_FILE%.md}.pdf"

if [ -z "$REPORT_FILE" ]; then
    echo "Uso: ./generate-pdf.sh <archivo.md>"
    exit 1
fi

if [ ! -f "$REPORT_FILE" ]; then
    echo "Error: Archivo $REPORT_FILE no existe"
    exit 1
fi

echo "📄 Generando PDF de: $REPORT_FILE"

# Crear versión temporal sin emojis
TEMP_FILE=$(mktemp)

# Reemplazar emojis comunes con texto
sed -e 's/🚨/[CRITICO]/g' \
    -e 's/✅/[OK]/g' \
    -e 's/🔥/[P0]/g' \
    -e 's/🎉/[DONE]/g' \
    -e 's/📊/[STATS]/g' \
    -e 's/🔄/[P2]/g' \
    -e 's/⚠️/[WARNING]/g' \
    -e 's/📄/[DOC]/g' \
    -e 's/📋/[TASKS]/g' \
    -e 's/💪//g' \
    -e 's/↔/ <-> /g' \
    "$REPORT_FILE" > "$TEMP_FILE"

# Generar PDF
pandoc "$TEMP_FILE" \
  -o "$OUTPUT_PDF" \
  --pdf-engine=xelatex \
  -V geometry:margin=0.75in \
  -V geometry:a4paper \
  -V fontsize=10pt \
  -V linestretch=1.2 \
  -V colorlinks=true \
  -V linkcolor=blue \
  -V urlcolor=blue \
  --wrap=auto \
  --toc

# Limpiar temporal
rm "$TEMP_FILE"

if [ -f "$OUTPUT_PDF" ]; then
    echo "✓ PDF generado: $OUTPUT_PDF"
    open "$OUTPUT_PDF"  # Abrir automáticamente en Mac
else
    echo "✗ Error al generar PDF"
    exit 1
fi
