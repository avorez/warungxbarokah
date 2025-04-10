let produk = JSON.parse(localStorage.getItem("produkList")) || [
  { nama: "Indomie Goreng", harga: 3000 },
  { nama: "Aqua Botol", harga: 4000 },
  { nama: "Kopi Sachet", harga: 2000 }
];

let keranjang = [];
let riwayat = JSON.parse(localStorage.getItem("riwayatTransaksi")) || [];

const daftarProduk = document.getElementById("daftarProduk");
const isiKeranjang = document.getElementById("isiKeranjang");
const cariProduk = document.getElementById("cariProduk");
const popupContainer = document.getElementById("popupContainer");
const totalHargaSpan = document.getElementById("totalHargaDisplay");

function tampilkanProduk(list = produk) {
  daftarProduk.innerHTML = "";
  list.forEach((item, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <span>${item.nama}<br>Rp${item.harga}</span>
      <button onclick="tambahKeKeranjang(${index})"><i class="fas fa-cart-plus"></i></button>
    `;
    daftarProduk.appendChild(div);
  });
}
tampilkanProduk();

function tambahKeKeranjang(index) {
  const item = produk[index];
  popupContainer.innerHTML = `
    <div class="popup">
      <button onclick="tutupPopup()" class="close-btn">&times;</button>
      <h3>Tambah ke Keranjang</h3>
      <p>${item.nama} - Rp${item.harga}</p>
      <input id="jumlahInput" type="number" placeholder="Jumlah" min="1" value="1" />
      <button onclick="konfirmasiTambah(${index})">Tambah</button>
    </div>
  `;
  popupContainer.classList.remove("hidden");
}

function konfirmasiTambah(index) {
  const jumlah = parseInt(document.getElementById("jumlahInput").value);
  if (isNaN(jumlah) || jumlah <= 0) return;

  const item = produk[index];
  const sudahAda = keranjang.find(p => p.nama === item.nama);
  if (sudahAda) {
    sudahAda.jumlah += jumlah;
  } else {
    keranjang.push({ ...item, jumlah });
  }
  updateKeranjang();
  tutupPopup();
}

function updateKeranjang() {
  isiKeranjang.innerHTML = "";
  let total = 0;
  keranjang.forEach((item) => {
    const subtotal = item.jumlah * item.harga;
    total += subtotal;
    isiKeranjang.innerHTML += `
      <div>
        <span>${item.nama} x ${item.jumlah}</span>
        <span>Rp${subtotal}</span>
      </div>
    `;
  });
  totalHargaSpan.textContent = `TOTAL: Rp${total}`;
}

cariProduk.addEventListener("input", () => {
  const keyword = cariProduk.value.toLowerCase();
  const hasil = produk.filter(p => p.nama.toLowerCase().includes(keyword));
  tampilkanProduk(hasil);
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (keranjang.length === 0) return;
  const total = keranjang.reduce((sum, item) => sum + item.jumlah * item.harga, 0);

  const waktu = new Date();
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  const tanggal = waktu.toLocaleDateString('id-ID', options);
  const jam = waktu.getHours().toString().padStart(2, '0') + ":" + waktu.getMinutes().toString().padStart(2, '0');
  const alamat = "Jl. Cempaka Raya (Samping praktek dr. Syaiful Anam)";

  const strukHTML = `
    <div class="popup" id="strukPopup">
      <button onclick="tutupPopup()" class="close-btn cetak-hide">&times;</button>
      <h3>Struk Pembelian</h3>
      <p><strong>Warung Barokah</strong></p>
      <p>${alamat}</p><hr/>
      ${keranjang.map(p => `<p>${p.nama} x ${p.jumlah} = Rp${p.jumlah * p.harga}</p>`).join("")}
      <hr/>
      <p><strong>Total: Rp${total}</strong></p>
      <hr/>
      <p>${tanggal} | ${jam} WIB</p>
      <p>*** Terima Kasih ***</p>
      <button onclick="downloadTxtStruk()" class="cetak-hide">Download TXT</button>
      <button onclick="printStruk()" class="cetak-hide">Print</button>
    </div>
  `;
  popupContainer.innerHTML = strukHTML;
  popupContainer.classList.remove("hidden");

  riwayat.push({ keranjang: [...keranjang], waktu: waktu.toLocaleString(), total });
  localStorage.setItem("riwayatTransaksi", JSON.stringify(riwayat));
  keranjang = [];
  updateKeranjang();
});

function printStruk() {
  const popup = document.getElementById("strukPopup");
  const strukClone = popup.cloneNode(true);
  strukClone.querySelectorAll(".cetak-hide").forEach(el => el.remove());

  const win = window.open("", "", "width=400,height=600");
  win.document.write(`<html><head><title>Print Struk</title></head><body>${strukClone.innerHTML}</body></html>`);
  win.document.close();
  win.print();
}

function downloadTxtStruk() {
  const waktu = new Date();
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  const tanggal = waktu.toLocaleDateString('id-ID', options);
  const jam = waktu.getHours().toString().padStart(2, '0') + ":" + waktu.getMinutes().toString().padStart(2, '0');

  let isi = `WARUNG BAROKAH\nJl. Cempaka Raya\n\n`;
  keranjang.forEach(p => {
    isi += `${p.nama} x ${p.jumlah} = Rp${p.jumlah * p.harga}\n`;
  });
  isi += `\n--------------------------------\n`;
  isi += `Total: Rp${keranjang.reduce((s, i) => s + i.jumlah * i.harga, 0)}\n`;
  isi += `--------------------------------\n`;
  isi += `${tanggal} | ${jam} WIB\n\n`;
  isi += `*** Terima Kasih ***`;

  const blob = new Blob([isi], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "struk.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function tutupPopup() {
  popupContainer.classList.add("hidden");
  popupContainer.innerHTML = "";
}

document.getElementById("tambahProdukBtn").addEventListener("click", () => {
  popupContainer.innerHTML = `
    <div class="popup">
      <button onclick="tutupPopup()" class="close-btn">&times;</button>
      <h3>Tambah Produk</h3>
      <input id="namaBaru" placeholder="Nama produk" />
      <input id="hargaBaru" placeholder="Harga" type="number" />
      <button onclick="simpanProduk()">Simpan</button>
    </div>
  `;
  popupContainer.classList.remove("hidden");
});

function simpanProduk() {
  const nama = document.getElementById("namaBaru").value;
  const harga = parseInt(document.getElementById("hargaBaru").value);
  if (!nama || !harga) return;
  produk.push({ nama, harga });
  localStorage.setItem("produkList", JSON.stringify(produk));
  tampilkanProduk();
  tutupPopup();
}

document.getElementById("kelolaBtn").addEventListener("click", () => {
  popupContainer.innerHTML = `
    <div class="popup">
      <button onclick="tutupPopup()" class="close-btn">&times;</button>
      <h3>Kelola Produk</h3>
      ${produk.map((p, i) => `
        <div class="kelola-item" style="display:flex; justify-content:space-between; align-items:center; margin:5px 0;">
          <span>${p.nama} - Rp${p.harga}</span>
          <button onclick="hapusProduk(${i})"><i class="fas fa-trash"></i></button>
        </div>`).join("")}
    </div>
  `;
  popupContainer.classList.remove("hidden");
});

function hapusProduk(index) {
  produk.splice(index, 1);
  localStorage.setItem("produkList", JSON.stringify(produk));
  tampilkanProduk();
  tutupPopup();
}

document.getElementById("riwayatBtn").addEventListener("click", () => {
  const totalPendapatan = riwayat.reduce((sum, r) => sum + r.total, 0);
  popupContainer.innerHTML = `
    <div class="popup" id="riwayatPopup">
      <button onclick="tutupPopup()" class="close-btn">&times;</button>
      <h3>Riwayat Transaksi</h3>
      <div class="scroll-riwayat" id="riwayatList">
        ${riwayat.map(r => `
          <div class="riwayat-item">
            <p><strong>${r.waktu}</strong></p>
            ${r.keranjang.map(k => `${k.nama} x ${k.jumlah}`).join(", ")}
            <p>Total: Rp${r.total}</p>
          </div>`).join("")}
        <hr/>
        <p><strong>Total Pendapatan: Rp${totalPendapatan}</strong></p>
      </div>
    </div>
  `;
  popupContainer.classList.remove("hidden");
});
