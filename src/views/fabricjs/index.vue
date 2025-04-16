<template>
  <div>
    <canvas id="fabric-canvas" width="800" height="500"></canvas>
    <div>
      <button @click="enableDrawingPolygon">绘制多边形</button>
      <button @click="enableDrawingRect">绘制矩形</button>
      <button @click="disableDrawing">选择</button>
    </div>
    <el-radio-group v-model="selectedOption" @input="updateSelectedRectLabel">
      <el-radio label="肯德基">肯德基</el-radio>
      <el-radio label="麦当劳">麦当劳</el-radio>
      <el-radio label="德克士">德克士</el-radio>
    </el-radio-group>
  </div>
</template>

<script>
import { fabric } from "fabric";

export default {
  name: "FabricCanvas",
  data() {
    return {
      canvas: null,
      isDrawingRect: false,
      isDrawingPolygon: false,
      startPoint: null,
      currentRect: null,
      selectedOption: null,
      rectLabelMap: new Map(), // 存储矩形与其标签的映射关系
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
        selection: false,
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

      // 选中对象时的样式
      this.canvas.on("selection:created", (e) => {
        const objs = e.selected;
        objs.forEach((obj) => {
          if (obj.type === "rect" || obj.type === "polygon") {
            obj.set({
              fill: "rgba(173, 216, 230, 0.5)", // 浅蓝色填充
              stroke: "blue", // 蓝色边框
              strokeWidth: 2,
              // 确保控制角和边框隐藏
              hasControls: false,
              hasBorders: false,
            });
            this.canvas.renderAll();
          }
        });
      });

      // 取消选中时的样式
      this.canvas.on("selection:cleared", (e) => {
        const objs = this.canvas.getObjects();
        objs.forEach((obj) => {
          if (obj.type === "rect" || obj.type === "polygon") {
            obj.set({
              fill: "transparent",
              stroke: "gray",
              strokeWidth: 1,
            });
          }
        });
        this.canvas.renderAll();
      });

      // 鼠标按下事件 - 开始绘制
      this.canvas.on("mouse:down", (options) => {
        console.log("mouse:down");
        const target = options.target;
        // 选择模式下
        if (!this.isDrawing) {
          // 标签不处理
          if (target?.type === "rect-label") {
            return;
          }
          // 矩形、多边形直接选中
          if (target?.type === "rect" || target?.type === "polygon") {
            this.selectObject(target);
            return;
          }
        }

        // 禁用所有对象的交互性
        this.canvas.getObjects().forEach((obj) => {
          obj.selectable = false;
          obj.evented = false; // 关键设置：禁止事件触发
        });
        this.canvas.discardActiveObject();

        const pointer = this.canvas.getPointer(options.e);

        // 新绘制的矩形
        if (this.isDrawingRect) {
          this.startPoint = { x: pointer.x, y: pointer.y };
          this.currentRect = new fabric.Rect({
            left: this.startPoint.x,
            top: this.startPoint.y,
            width: 0,
            height: 0,
            fill: "transparent",
            stroke: "gray",
            strokeWidth: 1,
            selectable: true,
            evented: false, // 新绘制的矩形在绘制过程中也不响应事件
          });

          this.canvas.add(this.currentRect);
          this.canvas.renderAll();
        }

        // 绘制多边形
        if (this.isDrawingPolygon) {
          // 如果是第一次点击，初始化多边形
          if (this.polygonPoints.length === 0) {
            this.polygonPoints = [pointer]; // 第一个固定点

            // 创建多边形对象（初始只有1个点，显示为点）
            this.currentPolygon = new fabric.Polygon(
              [pointer, pointer, pointer],
              {
                fill: "transparent",
                stroke: "gray",
                strokeWidth: 1,
                selectable: false,
                objectCaching: false,
                closed: true,
              }
            );
            this.canvas.add(this.currentPolygon);

            // 创建辅助线
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
          }
          // 否则添加新固定点
          else {
            this.polygonPoints.push(pointer);
            this.updatePolygon();
          }

          this.canvas.renderAll();
        }
      });

      // 鼠标移动事件 - 绘制中
      this.canvas.on("mouse:move", (options) => {
        if (!this.isDrawing) return;

        const pointer = this.canvas.getPointer(options.e);

        if (this.isDrawingRect && this.currentRect) {
          this.currentRect.set({
            width: Math.abs(pointer.x - this.startPoint.x),
            height: Math.abs(pointer.y - this.startPoint.y),
          });

          if (pointer.x < this.startPoint.x) {
            this.currentRect.set({ left: pointer.x });
          }

          if (pointer.y < this.startPoint.y) {
            this.currentRect.set({ top: pointer.y });
          }

          this.currentRect.setCoords();
          this.canvas.renderAll();
        }

        if (this.isDrawingPolygon) {
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
        }
      });

      // 鼠标释放事件 - 结束绘制
      this.canvas.on("mouse:up", () => {
        if (!this.isDrawing) return;

        if (this.isDrawingRect && this.currentRect) {
          // 自动选中刚刚绘制的矩形
          this.selectObject(this.currentRect);

          this.currentRect = null;
          this.startPoint = null;
        }
      });

      // 鼠标双击事件 - 完成多边形绘制
      this.canvas.on("mouse:dblclick", (options) => {
        options.e.preventDefault();
        if (!this.isDrawingPolygon || this.polygonPoints.length < 3) return;

        this.finishPolygon();
      });

      // 对象移动事件 - 同步移动标签
      this.canvas.on("object:moving", (e) => {
        if (e.target.type === "rect") {
          this.moveRectLabel(e.target);
        }
      });
    },

    // 选择对象
    selectObject(obj) {
      this.canvas.discardActiveObject();
      this.canvas.setActiveObject(obj);

      // 设置选中样式
      obj.set({
        fill: "rgba(173, 216, 230, 0.5)",
        stroke: "blue",
        strokeWidth: 2,
      });

      // 更新radio选中状态
      this.selectedOption = this.rectLabelMap.get(obj)?.text || "";

      this.canvas.renderAll();

      // 取消选中时的样式恢复
      this.canvas.once("selection:cleared", () => {
        obj.set({
          fill: "transparent",
          stroke: "gray",
          strokeWidth: 1,
        });
        this.canvas.renderAll();
      });
    },

    // 更新选中矩形的标签
    updateSelectedRectLabel() {
      const activeObject = this.canvas.getActiveObject();
      if (
        !activeObject ||
        (activeObject.type !== "rect" && activeObject.type !== "polygon")
      )
        return;

      // 移除旧的标签（如果存在）
      const oldLabel = this.rectLabelMap.get(activeObject);
      if (oldLabel) {
        this.canvas.remove(oldLabel);
      }

      if (this.selectedOption) {
        // 创建新标签
        const label = new fabric.Text(this.selectedOption, {
          left: activeObject.left,
          top: activeObject.top - 25,
          fontSize: 12,
          fill: "black",
          backgroundColor: "#e0e0e0",
          padding: 5,
          selectable: false,
          evented: false,
          type: "rect-label",
        });

        // 将标签与矩形关联
        this.canvas.add(label);
        this.rectLabelMap.set(activeObject, label);

        // 使标签随矩形移动
        activeObject.on("moving", () => this.moveRectLabel(activeObject));
      } else {
        this.rectLabelMap.delete(activeObject);
      }

      this.canvas.renderAll();
    },

    // 移动矩形标签
    moveRectLabel(rect) {
      const label = this.rectLabelMap.get(rect);
      if (label) {
        label.set({
          left: rect.left,
          top: rect.top - 25,
        });
        label.setCoords();
        this.canvas.renderAll();
      }
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
    },

    // 绘制多边形
    enableDrawingPolygon() {
      this.isDrawingPolygon = true;
      this.canvas.selection = false; // 禁用默认的选择行为
      this.canvas.defaultCursor = "crosshair"; // 设置鼠标样式为十字
      this.polygonPoints = [];
      this.currentPolygon = null;
      this.guideLine = null;

      this.isDrawingRect = false;
      this.currentRect = null;
    },

    //  绘制矩形
    enableDrawingRect() {
      this.isDrawingRect = true;
      this.currentRect = null;
      this.canvas.selection = false; // 禁用默认的选择行为
      this.canvas.defaultCursor = "crosshair"; // 设置鼠标样式为十字

      this.isDrawingPolygon = false;
      this.polygonPoints = [];
      this.currentPolygon = null;
      this.guideLine = null;
    },

    disableDrawing() {
      this.isDrawingRect = false;
      this.isDrawingPolygon = false;
      this.canvas.selection = true; // 恢复默认的选择行为
      this.canvas.defaultCursor = "default"; // 恢复默认鼠标样式

      this.canvas.getObjects().forEach((obj) => {
        obj.selectable = true;
        obj.evented = true;
      });

      // 确保新矩形可以交互
      this.currentRect?.set({
        evented: true,
      });
    },
  },
  computed: {
    isDrawing() {
      return this.isDrawingRect || this.isDrawingPolygon;
    },
  },
  beforeUnmount() {
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
</style>
