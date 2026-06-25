const LAST_BUCKET_STORAGE_KEY = "influxweb.lastBucket";

const BucketSelect = {
  async init(onBucketChanged) {
    this.select = document.getElementById("bucket-select");
    this.rangeStartInput = document.getElementById("range-start");
    this.rangeStopInput = document.getElementById("range-stop");
    this.onBucketChanged = onBucketChanged;

    const buckets = await Api.getBuckets();
    this.select.innerHTML = "";
    for (const bucket of buckets) {
      if (bucket.name.startsWith("_")) continue;
      const option = document.createElement("option");
      option.value = bucket.name;
      option.textContent = bucket.name;
      this.select.appendChild(option);
    }

    // A dynamically-populated <select> has no options yet when the browser
    // would otherwise restore a previous session's selection, so it can
    // never benefit from that the way a static <input> can - remember the
    // last choice ourselves instead.
    const lastBucket = localStorage.getItem(LAST_BUCKET_STORAGE_KEY);
    if (lastBucket && buckets.some((bucket) => bucket.name === lastBucket)) {
      this.select.value = lastBucket;
    }

    this.select.addEventListener("change", () => this._applyBucket());
    this.rangeStartInput.addEventListener("change", () => this._applyRange());
    this.rangeStopInput.addEventListener("change", () => this._applyRange());

    // Sync State to whatever the inputs actually show right now, not just
    // their HTML defaults - the browser can restore a previous session's
    // typed values into these inputs without firing a "change" event,
    // leaving State silently out of sync with what's visibly displayed.
    this._applyRange();

    if (buckets.length > 0) {
      this._applyBucket();
    }
  },

  _applyBucket() {
    State.bucket = this.select.value;
    State.measurements = [];
    State.tags = {};
    localStorage.setItem(LAST_BUCKET_STORAGE_KEY, State.bucket);
    this.onBucketChanged();
  },

  _applyRange() {
    State.rangeStart = this.rangeStartInput.value || "-1h";
    State.rangeStop = this.rangeStopInput.value || "now()";
  },

  setPreset(start) {
    this.rangeStartInput.value = start;
    this.rangeStopInput.value = "now()";
    this._applyRange();
  },
};
