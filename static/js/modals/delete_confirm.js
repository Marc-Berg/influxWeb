const DeleteConfirmModal = {
  init(onDeleted) {
    this.onDeleted = onDeleted;
    this.overlay = document.getElementById("delete-modal");
    this.body = document.getElementById("delete-modal-body");
    this.confirmButton = document.getElementById("delete-modal-confirm");
    this.cancelButton = document.getElementById("delete-modal-cancel");

    this.cancelButton.addEventListener("click", () => this.close());
    this.confirmButton.addEventListener("click", () => this._confirm());
  },

  async open() {
    if (!State.bucket) return;
    this.preview = null;
    this.mode = null;
    this.confirmButton.disabled = true;
    this.overlay.classList.add("open");
    this.body.innerHTML = "<p>Loading preview...</p>";

    try {
      const selectedRows = ResultsTable.getSelectedRows();
      if (selectedRows.length > 0) {
        this.mode = "selected";
        this.selectedDisplayRows = selectedRows;
        this.selectedPoints = selectedRows.map((row) => ({
          bucket: State.bucket,
          measurement: row.measurement,
          tags: row.tags,
          time: row.time,
        }));
        this.preview = await Api.previewDeleteSelected(this.selectedPoints);
      } else {
        this.mode = "range";
        this.preview = await Api.previewDelete(State.toSelection());
      }
      this._renderPreview();
      this.confirmButton.disabled = this.preview.matched_count === 0;
    } catch (error) {
      this.body.innerHTML = `<p class="status-line">Preview failed: ${error.message}</p>`;
    }
  },

  close() {
    this.overlay.classList.remove("open");
  },

  _renderPreview() {
    const preview = this.preview;
    if (preview.matched_count === 0) {
      this.body.innerHTML = "<p>Nothing matches - nothing to delete.</p>";
      return;
    }

    if (this.mode === "selected") {
      const rows = this.selectedDisplayRows
        .map(
          (point) =>
            `<tr><td>${point.measurement}</td><td>${Object.entries(point.tags)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ")}</td><td>${point.field}</td><td>${point.value}</td><td>${point.time}</td></tr>`
        )
        .join("");

      this.body.innerHTML = `
        <p><strong>${preview.matched_count}</strong> selected point(s) will be permanently deleted.</p>
        <p class="status-line">Note: deleting a point removes all fields recorded at that exact
          timestamp for its series, not just the field shown below.</p>
        <table class="preview-table">
          <thead><tr><th>Measurement</th><th>Tags</th><th>Field</th><th>Value</th><th>Time</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
      return;
    }

    const sampleRows = preview.sample_points
      .map(
        (point) =>
          `<tr><td>${point.measurement}</td><td>${Object.entries(point.tags)
            .map(([k, v]) => `${k}=${v}`)
            .join(", ")}</td><td>${point.field}</td><td>${point.value}</td><td>${point.time}</td></tr>`
      )
      .join("");

    this.body.innerHTML = `
      <p><strong>${preview.matched_count}</strong> point(s) will be permanently deleted.</p>
      <p class="status-line">Measurements affected: ${preview.measurements_affected.join(", ")}</p>
      <p class="status-line">Range: ${preview.resolved_start} &ndash; ${preview.resolved_stop}</p>
      <table class="preview-table">
        <thead><tr><th>Measurement</th><th>Tags</th><th>Field</th><th>Value</th><th>Time</th></tr></thead>
        <tbody>${sampleRows}</tbody>
      </table>
      ${preview.matched_count > preview.sample_points.length ? "<p class=\"status-line\">(showing a sample only)</p>" : ""}
    `;
  },

  async _confirm() {
    if (!this.preview || this.preview.matched_count === 0) return;
    this.confirmButton.disabled = true;
    this.body.innerHTML += "<p>Deleting...</p>";

    try {
      if (this.mode === "selected") {
        await Api.executeDeleteSelected(this.selectedPoints, this.preview.confirm_token);
      } else {
        const selection = State.toSelection();
        await Api.executeDelete({
          bucket: selection.bucket,
          measurements: selection.measurements,
          tags: selection.tags,
          resolved_start: this.preview.resolved_start,
          resolved_stop: this.preview.resolved_stop,
          confirm_token: this.preview.confirm_token,
        });
      }
      this.body.innerHTML = "<p>Deleted successfully.</p>";
      this.onDeleted();
      setTimeout(() => this.close(), 800);
    } catch (error) {
      this.body.innerHTML += `<p class="status-line">Delete failed: ${error.message}</p>`;
      this.confirmButton.disabled = false;
    }
  },
};
