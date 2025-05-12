function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

function numberToIP(num) {
  return [24, 16, 8, 0].map(shift => (num >> shift) & 255).join('.');
}

function parseCIDR(cidr) {
  const [ip, maskLength] = cidr.split('/');
  const start = ipToNumber(ip);
  const count = Math.pow(2, 32 - parseInt(maskLength));
  return Array.from({ length: count }, (_, i) => numberToIP(start + i));
}

function generateCSV() {
  const cidr = document.getElementById('cidrInput').value.trim();
  if (!cidr.includes('/') || cidr.split('/').length !== 2) {
    alert("Please enter a valid CIDR range, e.g., 192.168.1.0/30");
    return;
  }

  const ips = parseCIDR(cidr);
  let csvContent = "IP Address,Hostname,Note\n";
  csvContent += ips.map(ip => `${ip},,`).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ip_range.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
