var canvas = (this.__canvas = new fabric.Canvas(document.getElementById('c'), {
  backgroundColor: 'gray',
}));
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
const propertiesToInclude = ['p1', 'p0', 'p2', 'line'];
fabric.Text.prototype.toSVG = function (reviver) {
  if (this.type === 'curveText') {
    var noShadow = true,
      textDecoration = this.getSvgTextDecoration(this);

    var pathString = '';

    this.path?.path.forEach((p) => {
      pathString += p.join(' ');
      pathString += ', ';
    });

    return this._createBaseSVGMarkup(
      this.path?.path
        ? [
            '<defs>',
            '<path id="textOnPathId" fill="none" stroke="none" d="',
            pathString,
            '" />',
            '</defs>',
            '\t\t<text xml:space="preserve" ',
            this.fontFamily
              ? 'font-family="' + this.fontFamily.replace(/"/g, "'") + '" '
              : '',
            this.fontSize ? 'font-size="' + this.fontSize + '" ' : '',
            this.fontStyle ? 'font-style="' + this.fontStyle + '" ' : '',
            this.fontWeight ? 'font-weight="' + this.fontWeight + '" ' : '',
            textDecoration ? 'text-decoration="' + textDecoration + '" ' : '',
            'style="',
            this.getSvgStyles(noShadow),
            '"',
            this.addPaintOrder(),
            ' >',
            '<textPath side="',
            this.pathSide,
            '" href="#textOnPathId">',
            this.text,
            '</textPath>',
            '</text>\n',
          ]
        : [
            '\t\t<text xml:space="preserve" ',
            this.fontFamily
              ? 'font-family="' + this.fontFamily.replace(/"/g, "'") + '" '
              : '',
            this.fontSize ? 'font-size="' + this.fontSize + '" ' : '',
            this.fontStyle ? 'font-style="' + this.fontStyle + '" ' : '',
            this.fontWeight ? 'font-weight="' + this.fontWeight + '" ' : '',
            textDecoration ? 'text-decoration="' + textDecoration + '" ' : '',
            'style="',
            this.getSvgStyles(noShadow),
            '"',
            this.addPaintOrder(),
            ' >',
            this.text,
            '</text>\n',
          ],
      { reviver: reviver, noStyle: true, withShadow: true }
    );
  } else {
    return this._createBaseSVGMarkup(this._toSVG(), {
      reviver: reviver,
      noStyle: true,
      withShadow: true,
    });
  }
};

fabric.CurveText = fabric.util.createClass(fabric.Text, {
  type: 'curveText',
  makeCurvePoint(left, top, line1, line2, line3) {
    var c = new fabric.Circle({
      left: left,
      top: top,
      strokeWidth: 8,
      radius: 14,
      fill: '#fff',
      stroke: '#666',
    });

    c.hasBorders = c.hasControls = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;

    c.on('moving', () => {
      if (c.top < 0) {
        c.set({ top: 10 });
      }
      if (c.top > this.canvas.height) {
        c.set({ top: this.canvas.height - 10 });
      }
      if (c.left < 0) {
        c.set({ left: 10 });
      }
      if (c.left > this.canvas.width) {
        c.set({ left: this.canvas.width - 10 });
      }
      if (c.line2) {
        c.line2.path[1][1] = c.left;
        c.line2.path[1][2] = c.top;
        this.drawText(c.line2);
      }
    });
    return c;
  },
  makeCurveCircle(left, top, line1, line2, line3) {
    var c = new fabric.Circle({
      left: left,
      top: top,
      strokeWidth: 5,
      radius: 12,
      fill: '#fff',
      stroke: '#666',
    });

    c.hasBorders = c.hasControls = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;

    if (line1) {
      c.on('moving', () => {
        c.line1.path[0][1] = c.left;
        c.line1.path[0][2] = c.top;
        //this is to draw text on path
        this.drawText(c.line1);
      });
    }
    if (line3) {
      c.on('moving', () => {
        c.line3.path[1][3] = c.left;
        c.line3.path[1][4] = c.top;
        this.drawText(c.line3);
      });
    }

    return c;
  },
  drawText(path) {
    var pathInfo = fabric.util.getPathSegmentsInfo(path.path);
    path.segmentsInfo = pathInfo;
    var pathLength = pathInfo[pathInfo.length - 1].length;
    var fontSize = (2 * pathLength) / maintext.text.length;

    this.set({
      fontSize: fontSize,
      path: path,
      top: path.top,
      left: path.left,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
    });
    this.setCoords();
  },
  init(textObject, canvas) {
    maintext = textObject;
    console.log('canvas--> ', this.canvas);

    const line = new fabric.Path(
      `M 0 111 Q 100, ${this.canvas?.height + 200}, ${this.canvas?.width}, 0`,
      {
        objectCaching: false,
        fill: '',
        stroke: 'black',
      }
    );
    line.path[0][1] = maintext.left;
    line.path[0][2] = maintext.top;

    line.path[1][1] = maintext.left + maintext.width / 2;
    line.path[1][2] = maintext.top + maintext.width / 2;

    line.path[1][3] = maintext.left + maintext.width;
    line.path[1][4] = maintext.top;

    line.selectable = false;
    line.evented = false;
    line.visible = false;
    console.log('canvas--> ', this.canvas);

    this.p1 = this.makeCurvePoint(
      maintext.left + maintext.width / 2,
      maintext.top + maintext.height * 2,
      null,
      line,
      null
    );
    this.line = line;
    //this.canvas.add(line)

    //this.canvas.add(this.line)
    this.p0 = this.makeCurveCircle(
      maintext.left,
      maintext.top,
      line,
      this.p1,
      null
    );

    this.p2 = this.makeCurveCircle(
      maintext.left + maintext.width,
      maintext.top,
      null,
      this.p1,
      line
    );
    this.canvas.add(this.p2);
    this.canvas.add(this.p1);
    this.canvas.add(this.p0);

    this.drawText(this.line);
  },
  initialize: function (text, options) {
    options || (options = {});
    this.callSuper('initialize', text, options);
    this.set({ curve: true });

    this.init(this, options.canvas);
  },
  onDeselect: function () {
    this.canvas.remove(this.p0);
    this.canvas.remove(this.p1);
    this.canvas.remove(this.p2);
    this.canvas.remove(this.line);
  },

  render: function (ctx) {
    const commonLockProps = {
      hasControls: false,
      evented: false,
      selectable: false,
    };
    const commonUnLockProps = {
      hasControls: true,
      evented: true,
      selectable: true,
    };
    this.clearContextTop();
    // revert curve here
    if (!this.curve) {
      if (this.p0.visible) {
        this.set({
          path: null,
          left: this.p0.left,
          top: this.p0.top,
        });
        this.p0.set({
          ...commonLockProps,
          visible: false,
        });
        this.p1.set({
          ...commonLockProps,
          visible: false,
        });
        this.p2.set({
          ...commonLockProps,
          visible: false,
        });
        this.canvas.requestRenderAll();
      }
      this.set({
        path: null,
        originX: 'left',
        ...commonUnLockProps,
      });
    } else {
      // curve it again here

      if (!this.p0.visible) {
        this.p0.set({
          ...commonUnLockProps,
          visible: true,
          hasControls: false,
        });
        this.p1.set({
          ...commonUnLockProps,
          visible: true,
          hasControls: false,
        });
        this.p2.set({
          ...commonUnLockProps,
          visible: true,
          hasControls: false,
        });

        this.drawText(this.line);
        this.set({
          originX: 'center',
          ...commonLockProps,
        });
        this.canvas.requestRenderAll();
      }
    }
    this.callSuper('render', ctx);
    this.cursorOffsetCache = {};

    this.renderCursorOrSelection();
  },
  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _render: function (ctx) {
    this.callSuper('_render', ctx);
  },
  clearContextTop: function (skipRestore) {
    if (!this.isEditing || !this.canvas || !this.canvas.contextTop) {
      return;
    }
    var ctx = this.canvas.contextTop,
      v = this.canvas.viewportTransform;
    ctx.save();
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    this.transform(ctx);
    this._clearTextArea(ctx);
    skipRestore || ctx.restore();
  },
  renderCursorOrSelection: function () {
    if (!this.isEditing || !this.canvas || !this.canvas.contextTop) {
      return;
    }
    var boundaries = this._getCursorBoundaries(),
      ctx = this.canvas.contextTop;
    this.clearContextTop(true);
    if (this.selectionStart === this.selectionEnd) {
      this.renderCursor(boundaries, ctx);
    } else {
      this.renderSelection(boundaries, ctx);
    }
    ctx.restore();
  },
});

fabric.CurveText.fromObject = function (options) {
  return new fabric.CurveText(options.text, options);
};
