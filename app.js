class WallNamePicker {
  constructor() {
    this.items = [];
    this.initializeElements();
    this.bindEvents();
    this.selectedIndex = -1;
    
    // Load saved list on initialization
    this.loadSavedList();
  }

  initializeElements() {
    this.nameInput = document.getElementById('nameInput');
    this.generateButton = document.getElementById('generateButton');
    this.pickButton = document.getElementById('pickButton');
    this.exportButton = document.getElementById('exportButton');
    this.importButton = document.getElementById('importButton');
    this.importInput = document.getElementById('importInput');
    this.wallContainer = document.getElementById('wallContainer');
    this.resultDisplay = document.getElementById('result');
    this.removeContainer = document.getElementById('removeContainer');
    this.saveButton = document.getElementById('saveButton');
    this.loadButton = document.getElementById('loadButton');
  }

  bindEvents() {
    this.generateButton.addEventListener('click', () => this.generateWall());
    this.pickButton.addEventListener('click', () => this.pickRandom());
    this.exportButton.addEventListener('click', () => this.exportList());
    this.importButton.addEventListener('click', () => this.triggerImport());
    this.importInput.addEventListener('change', (e) => this.importList(e));
    this.saveButton.addEventListener('click', () => this.saveList());
    this.loadButton.addEventListener('click', () => this.loadSavedList());
  }

  parseInput() {
    const inputText = this.nameInput.value.trim();
    if (!inputText) return [];

    const parsedItems = [];
    inputText.split('\n').forEach(line => {
      line = line.trim();
      if (line.includes('-')) {
        const [start, end] = line.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          parsedItems.push(String(i));
        }
      } else if (line) {
        parsedItems.push(line);
      }
    });

    return parsedItems;
  }

  exportList() {
    const csvContent = this.items.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'wall_name_picker_list.csv');
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  triggerImport() {
    this.importInput.click();
  }

  importList(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      
      this.nameInput.value = content;
      
      this.generateWall();
    };
    reader.readAsText(file);
  }

  generateWall() {
    this.items = this.parseInput();
    if (this.items.length === 0) {
      this.resultDisplay.textContent = 'Please enter names or numbers';
      return;
    }

    this.wallContainer.innerHTML = '';
    this.resultDisplay.textContent = '';

    const gridSize = Math.ceil(Math.sqrt(this.items.length));
    this.wallContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    this.items.forEach((item, index) => {
      const square = document.createElement('div');
      square.classList.add('wall-square');
      square.textContent = item;
      square.style.backgroundColor = this.getRandomColor();
      this.wallContainer.appendChild(square);
    });
  }

  getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  }

  async pickRandom() {
    if (this.items.length === 0) {
      this.resultDisplay.textContent = 'Generate a wall first';
      return;
    }

    // Clear any previous remove button
    this.removeContainer.innerHTML = '';

    const squares = this.wallContainer.querySelectorAll('.wall-square');
    squares.forEach(square => {
      square.classList.remove('selected');
      square.classList.remove('highlight-sequence');
    });

    const animationCount = 10;
    for (let i = 0; i < animationCount; i++) {
      const randomIndex = Math.floor(Math.random() * this.items.length);
      const selectedSquare = squares[randomIndex];
      
      selectedSquare.classList.add('highlight-sequence');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      selectedSquare.classList.remove('highlight-sequence');
    }

    const finalRandomIndex = Math.floor(Math.random() * this.items.length);
    const finalSelectedSquare = squares[finalRandomIndex];
    finalSelectedSquare.classList.add('selected');
    this.resultDisplay.textContent = `Selected: ${this.items[finalRandomIndex]}`;
    
    // Store the selected index for potential removal
    this.selectedIndex = finalRandomIndex;

    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove Selected Item';
    removeButton.classList.add('remove-button');
    removeButton.addEventListener('click', () => this.removeSelectedItem());
    this.removeContainer.appendChild(removeButton);
  }

  removeSelectedItem() {
    if (this.selectedIndex === -1) return;

    // Remove the item from the list
    this.items.splice(this.selectedIndex, 1);

    // Clear result and remove container
    this.resultDisplay.textContent = '';
    this.removeContainer.innerHTML = '';

    if (this.items.length > 0) {
      // Regenerate the wall
      this.regenerateWall();
    } else {
      // No more items left
      this.resultDisplay.textContent = 'No more items left!';
      this.wallContainer.innerHTML = '';
    }

    // Reset selected index
    this.selectedIndex = -1;
  }

  regenerateWall() {
    const gridSize = Math.ceil(Math.sqrt(this.items.length));
    this.wallContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    this.wallContainer.innerHTML = '';

    this.items.forEach((item) => {
      const square = document.createElement('div');
      square.classList.add('wall-square');
      square.textContent = item;
      square.style.backgroundColor = this.getRandomColor();
      this.wallContainer.appendChild(square);
    });
  }

  saveList() {
    const listToSave = this.nameInput.value.trim();
    if (listToSave) {
      try {
        localStorage.setItem('wallNamePickerList', listToSave);
        this.showTemporaryMessage('List saved successfully!', 'green');
      } catch (error) {
        this.showTemporaryMessage('Failed to save list', 'red');
      }
    } else {
      this.showTemporaryMessage('No list to save', 'red');
    }
  }

  loadSavedList() {
    const savedList = localStorage.getItem('wallNamePickerList');
    if (savedList) {
      this.nameInput.value = savedList;
      this.generateWall();
      this.showTemporaryMessage('List loaded successfully!', 'green');
    } else {
      this.showTemporaryMessage('No saved list found', 'red');
    }
  }

  showTemporaryMessage(message, color) {
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.color = color;
    messageEl.style.textAlign = 'center';
    messageEl.style.marginTop = '10px';
    
    // Remove any existing message
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    messageEl.classList.add('temp-message');
    this.removeContainer.appendChild(messageEl);

    // Remove message after 3 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 3000);
  }

}

document.addEventListener('DOMContentLoaded', () => {
  new WallNamePicker();
});
