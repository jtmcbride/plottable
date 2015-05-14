///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   */
  export class Pie<D> extends Plot {

    private _colorScale: Scales.Color;
    private static _INNER_RADIUS_KEY = "inner-radius";
    private static _OUTER_RADIUS_KEY = "outer-radius";
    private static _SECTOR_VALUE_KEY = "sector-value";

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      super();
      this._colorScale = new Scales.Color();

      this._propertyBindings.set(Pie._INNER_RADIUS_KEY, { accessor: () => 0 });
      this._propertyBindings.set(Pie._OUTER_RADIUS_KEY, { accessor: () => Math.min(this.width(), this.height()) / 2 });
      this._propertyBindings.set(Pie._SECTOR_VALUE_KEY, { accessor: () => null });
      this.classed("pie-plot", true);
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
      var radiusLimit = Math.min(this.width(), this.height()) / 2;
      if (this.innerRadius().scale != null) {
        this.innerRadius().scale.range([0, radiusLimit]);
      }
      if (this.outerRadius().scale != null) {
        this.outerRadius().scale.range([0, radiusLimit]);
      }
      return this;
    }

    public addDataset(dataset: Dataset) {
      if (this._datasetKeysInOrder.length === 1) {
        Utils.Methods.warn("Only one dataset is supported in Pie plots");
        return this;
      }
      super.addDataset(dataset);
      return this;
    }

    protected _generateAttrToProjector(): AttributeToProjector {
      var attrToProjector = super._generateAttrToProjector();

      var defaultFillFunction = (d: any, i: number) => this._colorScale.scale(String(i));
      attrToProjector["fill"] = attrToProjector["fill"] || defaultFillFunction;

      return attrToProjector;
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Arc(key).setClass("arc");
    }

    public getAllPlotData(datasets = this.datasets()): Plots.PlotData {
      var allPlotData = super.getAllPlotData(datasets);

      allPlotData.pixelPoints.forEach((pixelPoint: Point) => {
        pixelPoint.x = pixelPoint.x + this.width() / 2;
        pixelPoint.y = pixelPoint.y + this.height() / 2;
      });

      return allPlotData;
    }

    public sectorValue(): AccessorScaleBinding<D, number>;
    public sectorValue(sectorValue: number | Accessor): Plots.Pie<D>;
    public sectorValue(sectorValue: D | Accessor, scale: Scale<D, number>): Plots.Pie<D>;
    public sectorValue(sectorValue?: number | Accessor | D, scale?: Scale<D, number>): any {
      if (sectorValue == null) {
        return this._propertyBindings.get(Pie._SECTOR_VALUE_KEY);
      }
      this._bindProperty(Pie._SECTOR_VALUE_KEY, sectorValue, scale);
      this._render();
      return this;
    }

    public innerRadius(): AccessorScaleBinding<D, number>;
    public innerRadius(innerRadius: number | Accessor): Plots.Pie<D>;
    public innerRadius(innerRadius: D | Accessor, scale: Scale<D, number>): Plots.Pie<D>;
    public innerRadius(innerRadius?: number | Accessor | D, scale?: Scale<D, number>): any {
      if (innerRadius == null) {
        return this._propertyBindings.get(Pie._INNER_RADIUS_KEY);
      }
      this._bindProperty(Pie._INNER_RADIUS_KEY, innerRadius, scale);
      this._render();
      return this;
    }

    public outerRadius(): AccessorScaleBinding<D, number>;
    public outerRadius(outerRadius: number | Accessor): Plots.Pie<D>;
    public outerRadius(outerRadius: D | Accessor, scale: Scale<D, number>): Plots.Pie<D>;
    public outerRadius(outerRadius?: number | Accessor | D, scale?: Scale<D, number>): any {
      if (outerRadius == null) {
        return this._propertyBindings.get(Pie._OUTER_RADIUS_KEY);
      }
      this._bindProperty(Pie._OUTER_RADIUS_KEY, outerRadius, scale);
      this._render();
      return this;
    }
  }
}
}
