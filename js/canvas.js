// Drawing Canvas Management with Apple Pencil Support
// Handles HTML5 Canvas with Fabric.js for professional drawing experience

class DrawingCanvas {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = null;
        this.isDrawing = false;
        this.currentPath = null;
        this.history = [];
        this.historyIndex = -1;
        this.brushSize = 8;
        this.brushColor = '#000000';
        
        this.init();
    }
    
    init() {
        try {
            // Initialize Fabric.js canvas
            this.canvas = new fabric.Canvas(this.canvasId, {
                width: 600,
                height: 600,
                backgroundColor: '#ffffff',
                selection: false, // Disable selection
                renderOnAddRemove: true,
                enableRetinaScaling: true
            });
            
            // Configure for drawing
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.width = this.brushSize;
            this.canvas.freeDrawingBrush.color = this.brushColor;
            
            // Set up Apple Pencil optimizations
            this.setupApplePencilSupport();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Save initial state
            this.saveState();
            
            console.log('🎨 Canvas initialized successfully');
        } catch (error) {
            console.error('Failed to initialize canvas:', error);
            throw error;
        }
    }
    
    setupApplePencilSupport() {
        const canvasElement = this.canvas.getElement();
        
        // Enable Apple Pencil specific features
        canvasElement.style.touchAction = 'none'; // Essential for Apple Pencil
        
        // Pressure sensitivity support
        if ('onpointerdown' in canvasElement) {
            this.setupPointerEvents(canvasElement);
        } else {
            console.warn('Pointer events not supported, using fallback touch events');
            this.setupTouchEvents(canvasElement);
        }
        
        // Prevent context menu
        canvasElement.addEventListener('contextmenu', (e) => e.preventDefault());
        
        console.log('✏️ Apple Pencil support configured');
    }
    
    setupPointerEvents(element) {
        let currentPressure = 0;
        
        element.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'pen') {
                this.handlePencilStart(e);
            }
        });
        
        element.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'pen' && this.isDrawing) {
                currentPressure = e.pressure || 0.5;
                this.handlePencilMove(e, currentPressure);
            }
        });
        
        element.addEventListener('pointerup', (e) => {
            if (e.pointerType === 'pen') {
                this.handlePencilEnd(e);
            }
        });
        
        // Handle palm rejection
        element.addEventListener('pointercancel', (e) => {
            if (e.pointerType === 'pen') {
                this.handlePencilEnd(e);
            }
        });
    }
    
    setupTouchEvents(element) {
        // Fallback for devices without pointer events
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDrawing = true;
        });
        
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDrawing = false;
        });
    }
    
    setupEventListeners() {
        // Path creation events for history tracking
        this.canvas.on('path:created', (e) => {
            this.onPathCreated(e);
        });
        
        // Drawing state tracking
        this.canvas.on('mouse:down', () => {
            this.isDrawing = true;
        });
        
        this.canvas.on('mouse:up', () => {
            this.isDrawing = false;
        });
        
        // Prevent scrolling on mobile/iPad
        this.canvas.on('mouse:wheel', (e) => {
            e.e.preventDefault();
        });
    }
    
    handlePencilStart(e) {
        this.isDrawing = true;
        
        // Update brush size based on pressure
        const pressure = e.pressure || 0.5;
        this.updateBrushPressure(pressure);
        
        // Show pressure indicator
        this.showPressureIndicator(pressure);
        
        console.log('✏️ Pencil drawing started, pressure:', pressure);
    }
    
    handlePencilMove(e, pressure) {
        if (!this.isDrawing) return;
        
        // Update brush size based on pressure
        this.updateBrushPressure(pressure);
        
        // Update pressure indicator
        this.updatePressureIndicator(pressure);
    }
    
    handlePencilEnd(e) {
        this.isDrawing = false;
        
        // Hide pressure indicator
        this.hidePressureIndicator();
        
        console.log('✏️ Pencil drawing ended');
    }
    
    updateBrushPressure(pressure) {
        // Map pressure (0-1) to brush size
        const minSize = this.brushSize * 0.5;
        const maxSize = this.brushSize * 1.5;
        const pressureSize = minSize + (pressure * (maxSize - minSize));
        
        if (this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.width = pressureSize;
        }
    }
    
    showPressureIndicator(pressure) {
        let indicator = document.getElementById('pressure-indicator');
        if (!indicator) {
            // Create pressure indicator if it doesn't exist
            indicator = this.createPressureIndicator();
        }
        
        indicator.classList.add('active');
        this.updatePressureIndicator(pressure);
    }
    
    updatePressureIndicator(pressure) {
        const indicator = document.getElementById('pressure-indicator');
        if (indicator) {
            const fill = indicator.querySelector('.pressure-fill');
            if (fill) {
                fill.style.width = `${pressure * 100}%`;
            }
        }
    }
    
    hidePressureIndicator() {
        const indicator = document.getElementById('pressure-indicator');
        if (indicator) {
            indicator.classList.remove('active');
        }
    }
    
    createPressureIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'pressure-indicator';
        indicator.className = 'pressure-indicator';
        indicator.innerHTML = '<div class=\"pressure-fill\"></div>';
        
        const canvasContainer = document.querySelector('.canvas-wrapper');
        if (canvasContainer) {
            canvasContainer.appendChild(indicator);
        }
        
        return indicator;
    }
    
    onPathCreated(e) {
        // Save state after each path is created
        this.saveState();
        
        // Reset brush size to original
        if (this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.width = this.brushSize;
        }
        
        console.log('🎨 Path created and state saved');
    }
    
    setBrushSize(size) {
        this.brushSize = size;
        if (this.canvas && this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.width = size;
        }
        console.log('🖌️ Brush size set to:', size);
    }
    
    setBrushColor(color) {
        this.brushColor = color;
        if (this.canvas && this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.color = color;
        }
        console.log('🎨 Brush color set to:', color);
    }
    
    clear() {
        if (this.canvas) {
            this.canvas.clear();
            this.canvas.backgroundColor = '#ffffff';
            this.canvas.renderAll();
            this.saveState();
            console.log('🧹 Canvas cleared');
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadState(this.history[this.historyIndex]);
            this.updateUndoRedoButtons();
            console.log('↶ Undo performed');
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadState(this.history[this.historyIndex]);
            this.updateUndoRedoButtons();
            console.log('↷ Redo performed');
        }
    }
    
    saveState() {
        if (!this.canvas) return;
        
        const state = JSON.stringify(this.canvas.toJSON());
        
        // Remove any states after current index (for branching undo)
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add new state
        this.history.push(state);
        this.historyIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.updateUndoRedoButtons();
    }
    
    loadState(state) {
        if (!this.canvas || !state) return;
        
        try {
            this.canvas.loadFromJSON(state, () => {
                this.canvas.renderAll();
            });
        } catch (error) {
            console.error('Failed to load canvas state:', error);
        }
    }
    
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = this.historyIndex <= 0;
            undoBtn.classList.toggle('undo', !undoBtn.disabled);
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.historyIndex >= this.history.length - 1;
            redoBtn.classList.toggle('redo', !redoBtn.disabled);
        }
    }
    
    exportAsImage(format = 'png') {
        if (!this.canvas) return null;
        
        try {
            return this.canvas.toDataURL(`image/${format}`, 1.0);
        } catch (error) {
            console.error('Failed to export canvas as image:', error);
            return null;
        }
    }
    
    getCanvasData() {
        if (!this.canvas) return null;
        
        return {
            json: this.canvas.toJSON(),
            svg: this.canvas.toSVG(),
            image: this.exportAsImage('png')
        };
    }
    
    resize(width, height) {
        if (this.canvas) {
            this.canvas.setWidth(width);
            this.canvas.setHeight(height);
            this.canvas.renderAll();
            console.log(`📐 Canvas resized to ${width}x${height}`);
        }
    }
    
    destroy() {
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
            console.log('🗑️ Canvas destroyed');
        }
    }
}

// Export for global use
window.DrawingCanvas = DrawingCanvas;