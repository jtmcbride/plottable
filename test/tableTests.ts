///<reference path="testReference.ts" />

var assert = chai.assert;

function generateBasicTable(nRows, nCols) {
  // makes a table with exactly nRows * nCols children in a regular grid, with each
  // child being a basic component
  var table = new Plottable.Table();
  var rows: Plottable.Component[][] = [];
  var components: Plottable.Component[] = [];
  for(var i = 0; i<nRows; i++) {
    for(var j = 0; j<nCols; j++) {
      var r = new Plottable.Component();
      table.addComponent(i, j, r);
      components.push(r);
    }
  }
  return {"table": table, "components": components};
}

describe("Tables", () => {
  it("tables are classed properly", () => {
    var table = new Plottable.Table();
    assert.isTrue(table.classed("table"));
  });

  it("padTableToSize works properly", () => {
    var t = new Plottable.Table();
    assert.deepEqual((<any> t).rows, [], "the table rows is an empty list");
    (<any> t).padTableToSize(1,1);
    var rows = (<any> t).rows;
    var row = rows[0];
    var firstComponent = row[0];
    assert.lengthOf(rows, 1, "there is one row");
    assert.lengthOf(row, 1, "the row has one element");
    assert.isNull(firstComponent, "the row only has a null component");

    (<any> t).padTableToSize(5,2);
    assert.lengthOf(rows, 5, "there are five rows");
    rows.forEach((r) => assert.lengthOf(r, 2, "there are two columsn per row"));
    assert.equal(rows[0][0], firstComponent, "the first component is unchanged");
  });

  it("table constructor can take a list of lists of components", () => {
    var c0 = new Plottable.Component();
    var row1 = [null, c0];
    var row2 = [new Plottable.Component(), null];
    var table = new Plottable.Table([row1, row2]);
    assert.equal((<any> table).rows[0][1], c0, "the component is in the right spot");
    var c1 = new Plottable.Component();
    table.addComponent(2, 2, c1);
    assert.equal((<any> table).rows[2][2], c1, "the inserted component went to the right spot");
  });

  it("tables can be constructed by adding components in matrix style", () => {
    var table = new Plottable.Table();
    var c1 = new Plottable.Component();
    var c2 = new Plottable.Component();
    table.addComponent(0, 0, c1);
    table.addComponent(1, 1, c2);
    var rows = (<any> table).rows;
    assert.lengthOf(rows, 2, "there are two rows");
    assert.lengthOf(rows[0], 2, "two cols in first row");
    assert.lengthOf(rows[1], 2, "two cols in second row");
    assert.equal(rows[0][0], c1, "first component added correctly");
    assert.equal(rows[1][1], c2, "second component added correctly");
    assert.isNull(rows[0][1], "component at (0, 1) is null");
    assert.isNull(rows[1][0], "component at (1, 0) is null");
  });

  it("can't add a component where one already exists", () => {
    var c1 = new Plottable.Table();
    var c2 = new Plottable.Table();
    var t = new Plottable.Table();
    t.addComponent(0, 2, c1);
    t.addComponent(0, 0, c2);
    assert.throws(() => t.addComponent(0, 2, c2), Error, "component already exists");
  });

  it("addComponent works even if a component is added with a high column and low row index", () => {
    // Solves #180, a weird bug
    var t = new Plottable.Table();
    var svg = generateSVG();
    t.addComponent(1, 0, new Plottable.Component());
    t.addComponent(0, 2, new Plottable.Component());
    t.renderTo(svg); //would throw an error without the fix (tested);
    svg.remove();
  });

  it("basic table with 2 rows 2 cols lays out properly", () => {
    var tableAndcomponents = generateBasicTable(2,2);
    var table = tableAndcomponents.table;
    var components = tableAndcomponents.components;

    var svg = generateSVG();
    table.renderTo(svg);

    var elements = components.map((r) => r.element);
    var translates = elements.map((e) => getTranslate(e));
    assert.deepEqual(translates[0], [0, 0], "first element is centered at origin");
    assert.deepEqual(translates[1], [200, 0], "second element is located properly");
    assert.deepEqual(translates[2], [0, 200], "third element is located properly");
    assert.deepEqual(translates[3], [200, 200], "fourth element is located properly");
    var bboxes = elements.map((e) => Plottable.Utils.getBBox(e));
    bboxes.forEach((b) => {
      assert.equal(b.width, 200, "bbox is 200 pixels wide");
      assert.equal(b.height, 200, "bbox is 200 pixels tall");
      });
    svg.remove();
  });

  it("table with 2 rows 2 cols and margin/padding lays out properly", () => {
    var tableAndcomponents = generateBasicTable(2,2);
    var table = tableAndcomponents.table;
    var components = tableAndcomponents.components;
    table.padding(5,5);

    var svg = generateSVG(415, 415);
    table.renderTo(svg);

    var elements = components.map((r) => r.element);
    var translates = elements.map((e) => getTranslate(e));
    var bboxes = elements.map((e) => Plottable.Utils.getBBox(e));
    assert.deepEqual(translates[0], [0, 0], "first element is centered properly");
    assert.deepEqual(translates[1], [210, 0], "second element is located properly");
    assert.deepEqual(translates[2], [0, 210], "third element is located properly");
    assert.deepEqual(translates[3], [210, 210], "fourth element is located properly");
    bboxes.forEach((b) => {
      assert.equal(b.width, 205, "bbox is 205 pixels wide");
      assert.equal(b.height, 205, "bbox is 205 pixels tall");
      });
    svg.remove();
  });

  it("table with fixed-size objects on every side lays out properly", () => {
    var svg = generateSVG();
    var c4 = new Plottable.Component();
    // [0 1 2] \\
    // [3 4 5] \\
    // [6 7 8] \\
    // give the axis-like objects a minimum
    var c1 = makeFixedSizeComponent(null, 30);
    var c7 = makeFixedSizeComponent(null, 30);
    var c3 = makeFixedSizeComponent(50, null);
    var c5 = makeFixedSizeComponent(50, null);
    var table = new Plottable.Table([[null, c1, null],
                                     [c3  , c4, c5  ],
                                     [null, c7, null]]);

    var components = [c1, c3, c4, c5, c7];

    table.renderTo(svg);

    var elements = components.map((r) => r.element);
    var translates = elements.map((e) => getTranslate(e));
    var bboxes = elements.map((e) => Plottable.Utils.getBBox(e));
    // test the translates
    assert.deepEqual(translates[0], [50, 0]  , "top axis translate");
    assert.deepEqual(translates[4], [50, 370], "bottom axis translate");
    assert.deepEqual(translates[1], [0, 30]  , "left axis translate");
    assert.deepEqual(translates[3], [350, 30], "right axis translate");
    assert.deepEqual(translates[2], [50, 30] , "plot translate");
    // test the bboxes
    assertBBoxEquivalence(bboxes[0], [300, 30], "top axis bbox");
    assertBBoxEquivalence(bboxes[4], [300, 30], "bottom axis bbox");
    assertBBoxEquivalence(bboxes[1], [50, 340], "left axis bbox");
    assertBBoxEquivalence(bboxes[3], [50, 340], "right axis bbox");
    assertBBoxEquivalence(bboxes[2], [300, 340], "plot bbox");
    svg.remove();
  });

  it("table space fixity calculates properly", () => {
    var tableAndcomponents = generateBasicTable(3,3);
    var table = tableAndcomponents.table;
    var components = tableAndcomponents.components;
    components.forEach((c) => fixComponentSize(c, 10, 10));
    assert.isTrue(table.isFixedWidth(), "fixed width when all subcomponents fixed width");
    assert.isTrue(table.isFixedHeight(), "fixedHeight when all subcomponents fixed height");
    fixComponentSize(components[0], null, 10);
    assert.isFalse(table.isFixedWidth(), "width not fixed when some subcomponent width not fixed");
    assert.isTrue(table.isFixedHeight(), "the height is still fixed when some subcomponent width not fixed");
    fixComponentSize(components[8], 10, null);
    fixComponentSize(components[0], 10, 10);
    assert.isTrue(table.isFixedWidth(), "width fixed again once no subcomponent width not fixed");
    assert.isFalse(table.isFixedHeight(), "height unfixed now that a subcomponent has unfixed height");
  });

  it("table._requestedSpace works properly", () => {
    // [0 1]
    // [2 3]
    var c0 = new Plottable.Component();
    var c1 = makeFixedSizeComponent(50, 50);
    var c2 = makeFixedSizeComponent(20, 50);
    var c3 = makeFixedSizeComponent(20, 20);

    function verifySpaceRequest(sr: Plottable.ISpaceRequest, w: number, h: number, ww: boolean, wh: boolean, id: string) {
      assert.equal(sr.width, w, "width requested is as expected #" + id);
      assert.equal(sr.height, h, "height requested is as expected #" + id);
      assert.equal(sr.wantsWidth, ww, "needs more width is as expected #" + id);
      assert.equal(sr.wantsHeight, wh, "needs more height is as expected #" + id);
    }

    var table = new Plottable.Table([[c0, c1], [c2, c3]]);

    var spaceRequest = table._requestedSpace(30, 30);
    verifySpaceRequest(spaceRequest, 30, 30, true, true, "1");

    spaceRequest = table._requestedSpace(50, 50);
    verifySpaceRequest(spaceRequest, 50, 50, true, true, "2");

    spaceRequest = table._requestedSpace(90, 90);
    verifySpaceRequest(spaceRequest, 70, 90, false, true, "3");

    spaceRequest = table._requestedSpace(200, 200);
    verifySpaceRequest(spaceRequest, 70, 100, false, false, "4");
  });

  describe("table.iterateLayout works properly", () => {
    // This test battery would have caught #405
    function verifyLayoutResult(result, cPS, rPS, gW, gH, wW, wH, id) {
      assert.deepEqual(result.colProportionalSpace, cPS, "colProportionalSpace:" + id);
      assert.deepEqual(result.rowProportionalSpace, rPS, "rowProportionalSpace:" + id);
      assert.deepEqual(result.guaranteedWidths, gW, "guaranteedWidths:" + id);
      assert.deepEqual(result.guaranteedHeights, gH, "guaranteedHeights:" + id);
      assert.deepEqual(result.wantsWidth, wW, "wantsWidth:" + id);
      assert.deepEqual(result.wantsHeight, wH, "wantsHeight:" + id);
    }

    var c1 = new Plottable.Component();
    var c2 = new Plottable.Component();
    var c3 = new Plottable.Component();
    var c4 = new Plottable.Component();
    var table = new Plottable.Table([
      [c1, c2],
      [c3, c4]]);

    it("iterateLayout works in the easy case where there is plenty of space and everything is satisfied on first go", () => {
      fixComponentSize(c1, 50, 50);
      fixComponentSize(c4, 20, 10);
      var result = (<any> table).iterateLayout(500, 500);
      verifyLayoutResult(result, [215, 215], [220, 220], [50, 20], [50, 10], false, false, "");
    });

    it("iterateLayout works in the difficult case where there is a shortage of space and layout requires iterations", () => {
      fixComponentSize(c1, 490, 50);
      var result = (<any> table).iterateLayout(500, 500);
      verifyLayoutResult(result, [0, 0], [220, 220], [480, 20], [50, 10], true, false, "");
    });

    it("iterateLayout works in the case where all components are fixed-size", () => {
      fixComponentSize(c1, 50, 50);
      fixComponentSize(c2, 50, 50);
      fixComponentSize(c3, 50, 50);
      fixComponentSize(c4, 50, 50);
      var result = (<any> table).iterateLayout(100, 100);
      verifyLayoutResult(result, [0, 0], [0, 0], [50, 50], [50, 50], false, false, "..when there's exactly enough space");

      result = (<any> table).iterateLayout(80, 80);
      verifyLayoutResult(result, [0, 0], [0, 0], [40, 40], [40, 40], true, true, "..when there's not enough space");

      result = (<any> table).iterateLayout(120, 120);
      verifyLayoutResult(result, [10, 10], [10, 10], [50, 50], [50, 50], false, false, "..when there's extra space");
    });

    it("iterateLayout works in the tricky case when components can be unsatisfied but request little space", () => {
      table = new Plottable.Table([[c1, c2]]);
      fixComponentSize(c1, null, null);
      c2._requestedSpace = (w: number, h: number) => {
        return {
          width: w >= 200 ? 200 : 0,
          height: h >= 200 ? 200 : 0,
          wantsWidth: w < 200,
          wantsHeight: h < 200
        };
      };
      var result = (<any> table).iterateLayout(200, 200);
      verifyLayoutResult(result, [0, 0], [0], [0, 200], [200], false, false, "when there's sufficient space");
      result = (<any> table).iterateLayout(150, 200);
      verifyLayoutResult(result, [150, 0], [0], [0, 0], [200], true, false, "when there's insufficient space");
    });
  });
});
