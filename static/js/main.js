async function applyQuery() {
  const status = document.getElementById("status-line");
  if (!State.bucket) return;
  status.textContent = "Querying...";
  try {
    const result = await Api.queryPoints(State.toSelection());
    ResultsTable.setRows(result.points);
    status.textContent = result.truncated
      ? `Showing first ${result.points.length} points (truncated)`
      : `${result.points.length} points`;
  } catch (error) {
    status.textContent = `Query failed: ${error.message}`;
  }
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportOds() {
  if (!State.bucket) return;
  const status = document.getElementById("status-line");
  const selectedRows = ResultsTable.getSelectedRows();
  try {
    if (selectedRows.length > 0) {
      const blob = await Api.exportOdsSelectedBlob(State.bucket, selectedRows);
      downloadBlob("influxweb-export.ods", blob);
    } else {
      window.location.href = Api.exportOdsUrl(State.toSelection());
    }
  } catch (error) {
    status.textContent = `Export failed: ${error.message}`;
  }
}

function clearSelection() {
  State.clearSelection();
  FilterBuilder.clearSelectionVisuals();

  const searchInput = document.getElementById("schema-search");
  searchInput.value = "";
  FilterBuilder.filterByText("");

  ResultsTable.setRows([]);
  document.getElementById("status-line").textContent = "Selection cleared - choose a measurement or tag value";
}

function updateToolbarLabels(selectedRows) {
  const count = selectedRows.length;
  document.getElementById("export-ods").textContent = count > 0 ? `Export selected (${count})` : "Export ODS";
  document.getElementById("delete-in-range").textContent = count > 0 ? `Delete selected (${count})` : "Delete in range";
}

document.addEventListener("DOMContentLoaded", async () => {
  ResultsTable.init((selectedRows) => updateToolbarLabels(selectedRows));
  DeleteConfirmModal.init(applyQuery);

  await BucketSelect.init(async () => {
    await FilterBuilder.render(applyQuery);
    await applyQuery();
  });

  document.getElementById("apply-query").addEventListener("click", applyQuery);
  document.getElementById("export-ods").addEventListener("click", exportOds);
  document.getElementById("clear-selection").addEventListener("click", clearSelection);
  document.getElementById("delete-in-range").addEventListener("click", () => DeleteConfirmModal.open());
});
