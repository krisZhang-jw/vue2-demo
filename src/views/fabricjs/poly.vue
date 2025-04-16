<template>
  <div>
    <canvas id="fabric-canvas" width="800" height="500"></canvas>
    <div>
      <button @click="startDrawingPolygon">绘制多边形</button>
      <button @click="cancelDrawing" v-if="isDrawingPolygon">取消绘制</button>
      <button @click="clearCanvas">清空画布</button>
      <p v-if="isDrawingPolygon">点击添加顶点，双击完成绘制（至少3个顶点）</p>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";

export default {
  name: "PolygonCanvas",
  data() {
    return {
      canvas: null,
      isDrawingPolygon: false,
      polygonPoints: [],
      currentPolygon: null,
      guideLine: null,
    };
  },
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      this.canvas = new fabric.Canvas("fabric-canvas", {
        selection: true,
        selectionColor: "rgba(0, 0, 255, 0.3)",
        selectionBorderColor: "blue",
        selectionLineWidth: 2,
      });

      // 设置默认样式
      fabric.Object.prototype.set({
        borderColor: "gray",
        cornerColor: "gray",
        cornerSize: 10,
        transparentCorners: false,
        padding: 10,
      });
    },

    // 开始绘制多边形
    startDrawingPolygon() {
      this.cancelDrawing(); // 先取消任何现有绘制
      this.isDrawingPolygon = true;
      this.canvas.selection = false;
      this.canvas.defaultCursor = "crosshair";

      // 设置画布事件监听
      this.setupDrawingEvents();
    },

    // 设置绘制事件监听
    setupDrawingEvents() {
      // 清除旧的事件监听器
      this.canvas.off("mouse:down");
      this.canvas.off("mouse:move");
      this.canvas.off("mouse:dblclick");

      // 鼠标点击事件 - 添加多边形顶点
      this.canvas.on("mouse:down", (options) => {
        if (!this.isDrawingPolygon || options.target) return;

        const pointer = this.canvas.getPointer(options.e);
        this.addPolygonPoint(pointer);
      });

      // 鼠标移动事件 - 更新辅助线
      this.canvas.on("mouse:move", (options) => {
        if (!this.isDrawingPolygon || this.polygonPoints.length === 0) return;

        this.updateGuideLine(options);
      });

      // 鼠标双击事件 - 完成多边形绘制
      this.canvas.on("mouse:dblclick", (options) => {
        options.e.preventDefault();
        if (!this.isDrawingPolygon || this.polygonPoints.length < 3) return;

        this.finishPolygon();
      });
    },

    // 添加多边形顶点
    addPolygonPoint(pointer) {
      // 如果是第一次点击，初始化多边形
      if (this.polygonPoints.length === 0) {
        this.polygonPoints = [pointer]; // 第一个固定点

        // 创建多边形对象（初始只有1个点，显示为点）
        this.currentPolygon = new fabric.Polygon([pointer, pointer, pointer], {
          fill: "transparent",
          stroke: "gray",
          strokeWidth: 1,
          selectable: false,
          objectCaching: false,
          closed: true,
        });
        this.canvas.add(this.currentPolygon);

        // 创建辅助线
        this.createGuideLine(pointer);
      }
      // 否则添加新固定点
      else {
        this.polygonPoints.push(pointer);
        this.updatePolygon();
      }

      this.canvas.renderAll();
    },

    // 创建辅助线
    createGuideLine(pointer) {
      const firstPoint = this.polygonPoints[0];

      this.guideLine = new fabric.Line(
        [firstPoint.x, firstPoint.y, pointer.x, pointer.y],
        {
          stroke: "red",
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }
      );
      this.canvas.add(this.guideLine);
    },

    // 更新辅助线
    updateGuideLine(options) {
      const pointer = this.canvas.getPointer(options.e);
      const firstPoint = this.polygonPoints[0];

      // 更新辅助线
      if (this.guideLine) {
        this.guideLine.set({
          x1: firstPoint.x,
          y1: firstPoint.y,
          x2: pointer.x,
          y2: pointer.y,
        });
        this.guideLine.setCoords();
      }

      // 更新多边形最后一个点（临时点）
      if (this.currentPolygon && this.polygonPoints.length > 0) {
        const points = [...this.polygonPoints, pointer];
        this.currentPolygon.set({ points });
        this.currentPolygon.setCoords();
      }

      this.canvas.renderAll();
    },

    // 更新多边形形状
    updatePolygon() {
      if (!this.currentPolygon || this.polygonPoints.length < 2) return;

      // 复制当前点并添加第一个点使多边形闭合
      const points = [...this.polygonPoints, this.polygonPoints[0]];
      this.currentPolygon.set({ points });
      this.currentPolygon.setCoords();
      this.canvas.renderAll();
    },

    // 取消绘制
    cancelDrawing() {
      if (this.guideLine) {
        this.canvas.remove(this.guideLine);
        this.guideLine = null;
      }
      if (this.currentPolygon) {
        this.canvas.remove(this.currentPolygon);
        this.currentPolygon = null;
      }
      this.isDrawingPolygon = false;
      this.polygonPoints = [];
      this.canvas.selection = true;
      this.canvas.defaultCursor = "default";
      this.canvas.renderAll();

      // 移除临时事件监听
      this.canvas.off("mouse:down");
      this.canvas.off("mouse:move");
      this.canvas.off("mouse:dblclick");
    },

    // 完成多边形绘制
    finishPolygon() {
      // 确保至少3个顶点
      if (this.polygonPoints.length < 3) {
        alert("多边形至少需要3个顶点");
        this.cancelDrawing();
        return;
      }

      // 创建最终多边形（闭合路径）
      const finalPolygon = new fabric.Polygon(this.polygonPoints, {
        fill: "rgba(173, 216, 230, 0.3)",
        stroke: "blue",
        strokeWidth: 2,
        selectable: true,
        objectCaching: true,
        closed: true,
      });

      // 移除临时多边形和辅助线
      this.canvas.remove(this.currentPolygon);
      if (this.guideLine) {
        this.canvas.remove(this.guideLine);
      }

      // 添加最终多边形
      this.canvas.add(finalPolygon);

      // 重置状态
      this.isDrawingPolygon = false;
      this.polygonPoints = [];
      this.currentPolygon = null;
      this.guideLine = null;
      this.canvas.selection = true;
      this.canvas.defaultCursor = "default";
      this.canvas.renderAll();

      // 移除临时事件监听
      this.canvas.off("mouse:down");
      this.canvas.off("mouse:move");
      this.canvas.off("mouse:dblclick");
    },

    clearCanvas() {
      this.cancelDrawing();
      this.canvas.clear();
      this.canvas.renderAll();
    },
  },
  beforeDestroy() {
    if (this.canvas) {
      this.canvas.dispose();
    }
  },
};
</script>

<style scoped>
#fabric-canvas {
  border: 1px solid #ccc;
  margin-bottom: 10px;
}
button {
  margin-right: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
p {
  color: #666;
  font-size: 14px;
}
</style>
