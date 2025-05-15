const availableColumns = [
  'Hostname', 'MAC Address', 'Status', 'Note', 'Device Type',
  'Location', 'Owner', 'Last Seen', 'Operating System', 'Vendor'
];
let selectedColumns = [];

function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

function numberToIP(num) {
  return [24, 16, 8, 0].map(shift => (num >> shift) & 255).join('.');
}

function parseCIDR(ip, mask) {
  const start = ipToNumber(ip);
  const count = Math.pow(2, 32 - parseInt(mask));
  return Array.from({ length: count }, (_, i) => numberToIP(start + i));
}

function renderSelectedColumns() {
  const container = document.getElementById('selectedColumns');
  container.innerHTML = '';
  selectedColumns.forEach((col, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center gap-2';

    const tag = document.createElement('div');
    tag.className = 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex-1';
    tag.innerText = col;

    const upBtn = document.createElement('button');
    upBtn.innerHTML = '⬆️';
    upBtn.onclick = () => moveColumn(index, -1);

    const downBtn = document.createElement('button');
    downBtn.innerHTML = '⬇️';
    downBtn.onclick = () => moveColumn(index, 1);

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '❌';
    removeBtn.onclick = () => removeColumn(col);

    wrapper.appendChild(tag);
    wrapper.appendChild(upBtn);
    wrapper.appendChild(downBtn);
    wrapper.appendChild(removeBtn);
    container.appendChild(wrapper);
  });
}

function renderColumnButtons() {
  const container = document.getElementById('columnButtons');
  container.innerHTML = '';

  const colorPairs = [
    ['bg-blue-200', 'text-blue-800'],
    ['bg-green-200', 'text-green-800'],
    ['bg-yellow-200', 'text-yellow-800'],
    ['bg-purple-200', 'text-purple-800'],
    ['bg-pink-200', 'text-pink-800'],
    ['bg-teal-200', 'text-teal-800'],
    ['bg-orange-200', 'text-orange-800'],
    ['bg-red-200', 'text-red-800'],
    ['bg-indigo-200', 'text-indigo-800'],
    ['bg-rose-200', 'text-rose-800'],
  ];

  availableColumns.forEach(col => {
    const [bg, text] = colorPairs[Math.floor(Math.random() * colorPairs.length)];

    const btn = document.createElement('button');
    btn.textContent = col;
    btn.className = `${bg} ${text} px-3 py-1 rounded hover:brightness-110 transition-all text-sm font-medium`;
    btn.onclick = () => addColumn(col);
    container.appendChild(btn);
  });
}


function addColumn(col) {
  if (!selectedColumns.includes(col)) {
    selectedColumns.push(col);
    renderSelectedColumns();
  }
}

function addCustomColumn() {
  const input = document.getElementById('customColumnInput');
  const col = input.value.trim();
  if (col && !selectedColumns.includes(col)) {
    selectedColumns.push(col);
    input.value = '';
    renderSelectedColumns();
  }
}

function removeColumn(col) {
  selectedColumns = selectedColumns.filter(c => c !== col);
  renderSelectedColumns();
}

function moveColumn(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= selectedColumns.length) return;
  const temp = selectedColumns[newIndex];
  selectedColumns[newIndex] = selectedColumns[index];
  selectedColumns[index] = temp;
  renderSelectedColumns();
}

function clearInput() {
  document.getElementById('ipInput').value = '';
  document.getElementById('maskInput').value = '';
  document.getElementById('customColumnInput').value = '';
  selectedColumns = [];
  renderSelectedColumns();
}

function generateCSV() {
  const table = document.getElementById('previewTable');
  if (!table || table.rows.length === 0) {
    alert("Please preview the table before downloading.");
    return;
  }

  let csvContent = "";
  const rows = table.querySelectorAll("tr");

  rows.forEach((row, rowIndex) => {
    const cols = row.querySelectorAll("th, td");
    const rowData = [];

    cols.forEach((cell, colIndex) => {
      if (rowIndex === 0) {
        rowData.push(cell.textContent.trim());
      } else {
        if (colIndex === 0) {
          rowData.push(cell.textContent.trim()); // IP Address
        } else {
          const input = cell.querySelector("input");
          rowData.push(input ? input.value.trim() : "");
        }
      }
    });

    csvContent += rowData.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ip_spreadsheet.csv";
  link.click();
}


renderColumnButtons();
renderSelectedColumns();



function togglePreview() {
  const container = document.getElementById('previewTableContainer');
  if (container.classList.contains('hidden')) {
    showPreviewTable();
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
}

function showPreviewTable() {
  const ip = document.getElementById('ipInput').value.trim();
  const mask = document.getElementById('maskInput').value.trim();
  const table = document.getElementById('previewTable');

  if (!ip || !mask || isNaN(mask)) {
    alert("Please enter a valid IP and netmask.");
    return;
  }

  const ips = parseCIDR(ip, mask);
  const headers = ['IP Address', ...selectedColumns];

  table.innerHTML = '';

  // Header
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    th.className = 'border px-3 py-2 bg-gray-200 text-gray-700 font-medium';
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  ips.forEach(ipAddr => {
    const tr = document.createElement('tr');
    headers.forEach((h, idx) => {
      const td = document.createElement('td');
      td.className = 'border px-3 py-2';

      if (idx === 0) {
        td.textContent = ipAddr; // IP Address (non-editable)
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'w-full p-1 border border-gray-300 rounded text-sm';
        td.appendChild(input);
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}


function clearPreview() {
  const container = document.getElementById('previewTableContainer');
  const table = document.getElementById('previewTable');
  table.innerHTML = '';
  container.classList.add('hidden');
}

function generateXLSX() {
  const table = document.getElementById('previewTable');
  if (!table || table.rows.length === 0) {
    alert("Please preview the table before downloading.");
    return;
  }

  const data = [];
  const rows = table.querySelectorAll("tr");

  rows.forEach((row, rowIndex) => {
    const cols = row.querySelectorAll("th, td");
    const rowData = [];

    cols.forEach((cell, colIndex) => {
      if (rowIndex === 0) {
        rowData.push(cell.textContent.trim());
      } else {
        if (colIndex === 0) {
          rowData.push(cell.textContent.trim()); // IP
        } else {
          const input = cell.querySelector("input");
          rowData.push(input ? input.value.trim() : "");
        }
      }
    });

    data.push(rowData);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "IP Spreadsheet");

  XLSX.writeFile(workbook, "ip_spreadsheet.xlsx");
}
