///<reference path="../../reference.ts" />

module Plottable {
  export module Formatter {
    export class Custom extends Abstract.Formatter {
      /**
       * Creates a Custom Formatter.
       *
       * @constructor
       * @param {(d: any, formatter: Formatter.Custom) => string} customFormatFunction A
       *                           formatting function that is passed a datum
       *                           and the Custom Formatter itself.
       * @param {number} precision The precision of the Custom Formatter. The
       *                           actual behavior will depend on the customFormatFunction.
       */
      constructor(customFormatFunction: (d: any, formatter: Formatter.Custom) => string, precision = 0) {
        super(precision);
        if (customFormatFunction == null) {throw new Error("Custom Formatters require a formatting function");}
        this._onlyShowUnchanged = false;
        this._formatFunction = function(d: any) {
          return customFormatFunction(d, this);
        };
      }
    }
  }
}
