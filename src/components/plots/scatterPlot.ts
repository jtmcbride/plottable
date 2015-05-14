///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Scatter<X, Y> extends XYPlot<X, Y> {
    private _defaultFillColor: string;
    private static _SIZE_KEY = "size";
    private static _SYMBOL_KEY = "symbol";

    /**
     * Constructs a ScatterPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>) {
      super(xScale, yScale);
      this.classed("scatter-plot", true);
      this._defaultFillColor = new Scales.Color().range()[0];

      this.animator("symbols-reset", new Animators.Null());
      this.animator("symbols", new Animators.Base()
                                           .duration(250)
                                           .delay(5));
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Symbol(key);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["size"] = attrToProjector["size"] || d3.functor(6);
      attrToProjector["opacity"] = attrToProjector["opacity"] || d3.functor(0.6);
      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this._defaultFillColor);
      attrToProjector["symbol"] = attrToProjector["symbol"] || (() => SymbolFactories.circle());

      return attrToProjector;
    }

    public size(): AccessorScaleBinding<X, number>;
    public size(size: number | Accessor): Plots.Scatter<X, Y>;
    public size(size: any | Accessor, scale: Scale<any, number>): Plots.Scatter<X, Y>;
    public size(size?: number | Accessor | any, scale?: Scale<any, number>): any {
      if (size == null) {
        return this._propertyBindings.get(Scatter._SIZE_KEY);
      }
      this._bindProperty(Scatter._SIZE_KEY, size, scale);
      this._render();
      return this;
    }

    public symbol(): AccessorScaleBinding<any, any>;
    public symbol(symbol: Accessor): Plots.Scatter<X, Y>;
    public symbol(symbol?: Accessor): any {
      if (symbol == null) {
        return this._propertyBindings.get(Scatter._SYMBOL_KEY);
      }
      this._propertyBindings.set(Scatter._SYMBOL_KEY, { accessor: symbol });
      this._render();
      return this;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var resetAttrToProjector = this._generateAttrToProjector();
        resetAttrToProjector["size"] = () => 0;
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this._getAnimator("symbols-reset")});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("symbols")});
      return drawSteps;
    }

    protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean {
      var xRange = { min: 0, max: this.width() };
      var yRange = { min: 0, max: this.height() };

      var translation = d3.transform(selection.attr("transform")).translate;
      var bbox = selection[0][0].getBBox();
      var translatedBbox: SVGRect = {
        x: bbox.x + translation[0],
        y: bbox.y + translation[1],
        width: bbox.width,
        height: bbox.height
      };

      return Utils.Methods.intersectsBBox(xRange, yRange, translatedBbox);
    }
  }
}
}
