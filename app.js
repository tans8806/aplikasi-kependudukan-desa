const API_URL = "/api/penduduk";

/* =====================================================
   STATE APLIKASI
===================================================== */

let currentPage = 1;
let currentLimit = 10;
let currentSearch = "";
let editMode = false;
let editId = null;


/* =====================================================
   UTILITAS
===================================================== */

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =====================================================
   API GET
===================================================== */

async function apiGet(params = {}) {

  const query = new URLSearchParams(params);

  const response = await fetch(
    `${API_URL}?${query.toString()}`
  );

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error(
      "Server mengembalikan response yang tidak valid."
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Request gagal."
    );
  }

  return result;
}


/* =====================================================
   API POST
===================================================== */

async function apiPost(payload) {

  const response = await fetch(
    API_URL,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)
    }
  );

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error(
      "Server mengembalikan response yang tidak valid."
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Request gagal."
    );
  }

  return result;
}


/* =====================================================
   CEK API
===================================================== */

async function checkApi() {

  const dot =
    document.getElementById("apiStatus");

  const text =
    document.getElementById("apiStatusText");

  try {

    const result =
      await apiGet({
        action: "health"
      });

    if (result.success) {

      if (dot) {
        dot.style.background = "#22c55e";
      }

      if (text) {
        text.textContent = "API Terhubung";
      }

    }

  } catch (error) {

    if (dot) {
      dot.style.background = "#ef4444";
    }

    if (text) {
      text.textContent = "API Tidak Terhubung";
    }

    console.error(error);
  }
}


/* =====================================================
   DASHBOARD
===================================================== */

async function loadDashboard() {

  try {

    const result =
      await apiGet({
        action: "stats"
      });

    const stats =
      result.data || {};

    const totalPenduduk =
      document.getElementById("totalPenduduk");

    const totalLaki =
      document.getElementById("totalLaki");

    const totalPerempuan =
      document.getElementById("totalPerempuan");

    const totalKK =
      document.getElementById("totalKK");


    if (totalPenduduk) {
      totalPenduduk.textContent =
        stats.totalPenduduk || 0;
    }

    if (totalLaki) {
      totalLaki.textContent =
        stats.lakiLaki || 0;
    }

    if (totalPerempuan) {
      totalPerempuan.textContent =
        stats.perempuan || 0;
    }

    if (totalKK) {
      totalKK.textContent =
        stats.totalKK || 0;
    }

  } catch (error) {

    console.error(
      "Gagal memuat dashboard:",
      error
    );

  }
}


/* =====================================================
   LOAD DATA PENDUDUK
===================================================== */

async function loadPenduduk(page = currentPage) {

  const table =
    document.getElementById(
      "pendudukTable"
    );

  if (!table) {
    return;
  }


  table.innerHTML = `
    <tr>
      <td colspan="9" class="loading">
        Memuat data...
      </td>
    </tr>
  `;


  currentPage = page;


  try {

    const searchElement =
      document.getElementById(
        "searchInput"
      );


    currentSearch =
      searchElement
        ? searchElement.value.trim()
        : currentSearch;


    const result =
      await apiGet({

        action: "list",

        q: currentSearch,

        page: currentPage,

        limit: currentLimit

      });


    /*
      Backend kita sebelumnya mengembalikan
      data penduduk di result.data.
    */

    const data =
      result.data || [];


    renderPenduduk(data);


    /*
      Jika backend mengirim informasi pagination,
      kita gunakan.
    */

    renderPagination(
      result.pagination,
      data.length
    );


  } catch (error) {

    table.innerHTML = `
      <tr>
        <td colspan="9" class="loading">
          ${escapeHtml(
            error.message
          )}
        </td>
      </tr>
    `;

    renderPagination(
      null,
      0
    );

  }
}


/* =====================================================
   RENDER TABEL
===================================================== */

function renderPenduduk(data) {

  const table =
    document.getElementById(
      "pendudukTable"
    );


  if (!table) {
    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    table.innerHTML = `
      <tr>
        <td
          colspan="9"
          class="loading"
        >
          Belum ada data penduduk.
        </td>
      </tr>
    `;

    return;
  }


  /*
    Nomor baris mengikuti halaman.
  */

  const nomorAwal =
    (
      (currentPage - 1)
      *
      currentLimit
    );


  table.innerHTML =
    data.map(
      (item, index) => {

        const nomor =
          nomorAwal + index + 1;


        return `

          <tr>

            <td>
              ${nomor}
            </td>

            <td>
              ${escapeHtml(
                item.nik
              )}
            </td>

            <td>
              ${escapeHtml(
                item.noKK
              )}
            </td>

            <td>
              <strong>
                ${escapeHtml(
                  item.namaLengkap
                )}
              </strong>
            </td>

            <td>
              ${escapeHtml(
                item.jenisKelamin
              )}
            </td>

            <td>
              ${escapeHtml(
                item.tanggalLahir
              )}
            </td>

            <td>
              ${escapeHtml(
                item.umur
              )}
            </td>

            <td>
              ${escapeHtml(
                item.statusHubunganKeluarga
              )}
            </td>

            <td>

              <button
                class="btn-secondary"
                type="button"
                onclick="editPenduduk('${escapeHtml(
                  item.idPenduduk
                )}')"
              >
                Edit
              </button>

              <button
                class="btn-secondary"
                type="button"
                onclick="hapusPenduduk('${escapeHtml(
                  item.idPenduduk
                )}')"
              >
                Hapus
              </button>

            </td>

          </tr>

        `;
      }
    ).join("");

}


/* =====================================================
   PAGINATION
===================================================== */

function renderPagination(
  pagination,
  dataLength
) {

  /*
    Cari container pagination.
    Jika belum ada di HTML,
    kita buat otomatis.
  */

  let container =
    document.getElementById(
      "pagination"
    );


  const table =
    document.getElementById(
      "pendudukTable"
    );


  if (!container && table) {

    container =
      document.createElement(
        "div"
      );

    container.id =
      "pagination";

    container.style.display =
      "flex";

    container.style.justifyContent =
      "center";

    container.style.alignItems =
      "center";

    container.style.gap =
      "8px";

    container.style.marginTop =
      "20px";

    table.parentElement.appendChild(
      container
    );
  }


  if (!container) {
    return;
  }


  /*
    Backend mungkin memberikan:
    page
    limit
    total
    totalPages
  */

  let totalPages = 1;


  if (
    pagination &&
    pagination.totalPages
  ) {

    totalPages =
      Number(
        pagination.totalPages
      );

  } else if (
    pagination &&
    pagination.total
  ) {

    totalPages =
      Math.ceil(
        Number(pagination.total)
        /
        currentLimit
      );

  } else {

    /*
      Jika belum ada metadata pagination,
      gunakan perkiraan sederhana.
    */

    totalPages =
      dataLength < currentLimit
        ? currentPage
        : currentPage + 1;
  }


  if (totalPages <= 1) {

    container.innerHTML = "";
    return;
  }


  let html = "";


  /* Tombol sebelumnya */

  html += `
    <button
      class="btn-secondary"
      type="button"
      ${currentPage <= 1
        ? "disabled"
        : ""}
      onclick="goToPage(${currentPage - 1})"
    >
      ‹ Sebelumnya
    </button>
  `;


  /*
    Nomor halaman
  */

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {

    html += `
      <button
        class="btn-secondary"
        type="button"
        ${i === currentPage
          ? "disabled"
          : ""}
        onclick="goToPage(${i})"
      >
        ${i}
      </button>
    `;
  }


  /* Tombol berikutnya */

  html += `
    <button
      class="btn-secondary"
      type="button"
      ${currentPage >= totalPages
        ? "disabled"
        : ""}
      onclick="goToPage(${currentPage + 1})"
    >
      Berikutnya ›
    </button>
  `;


  container.innerHTML =
    html;
}


/* =====================================================
   PINDAH HALAMAN
===================================================== */

function goToPage(page) {

  if (page < 1) {
    return;
  }

  currentPage = page;

  loadPenduduk(
    currentPage
  );
}


/* =====================================================
   PENCARIAN
===================================================== */

function cariPenduduk() {

  currentPage = 1;

  loadPenduduk(1);
}


/* =====================================================
   FORM DATA
===================================================== */

function ambilDataForm() {

  const noKK =
    document
      .getElementById("noKK")
      .value
      .trim();


  const nik =
    document
      .getElementById("nik")
      .value
      .trim();


  /*
    VALIDASI KK
  */

  if (
    !/^\d{16}$/.test(
      noKK
    )
  ) {

    throw new Error(
      "No. KK harus tepat 16 digit."
    );
  }


  /*
    VALIDASI NIK
  */

  if (
    !/^\d{16}$/.test(
      nik
    )
  ) {

    throw new Error(
      "NIK harus tepat 16 digit."
    );
  }


  return {

    noKK,

    nik,

    namaLengkap:
      document
        .getElementById(
          "namaLengkap"
        )
        .value
        .trim(),

    jenisKelamin:
      document
        .getElementById(
          "jenisKelamin"
        )
        .value,

    tempatLahir:
      document
        .getElementById(
          "tempatLahir"
        )
        .value
        .trim(),

    tanggalLahir:
      document
        .getElementById(
          "tanggalLahir"
        )
        .value,

    agama:
      document
        .getElementById(
          "agama"
        )
        .value,

    pendidikan:
      document
        .getElementById(
          "pendidikan"
        )
        .value
        .trim(),

    jenisPekerjaan:
      document
        .getElementById(
          "jenisPekerjaan"
        )
        .value
        .trim(),

    statusPerkawinan:
      document
        .getElementById(
          "statusPerkawinan"
        )
        .value,

    statusHubunganKeluarga:
      document
        .getElementById(
          "statusHubunganKeluarga"
        )
        .value,

    kewarganegaraan:
      document
        .getElementById(
          "kewarganegaraan"
        )
        .value
        .trim(),

    alamat:
      document
        .getElementById(
          "alamat"
        )
        .value
        .trim(),

    rt:
      document
        .getElementById(
          "rt"
        )
        .value
        .trim(),

    rw:
      document
        .getElementById(
          "rw"
        )
        .value
        .trim(),

    desaKelurahan:
      "Pancasura",

    kecamatan:
      "Singajaya",

    kabupatenKota:
      "Garut",

    provinsi:
      "Jawa Barat",

    kodePos:
      "44173"
  };
}


/* =====================================================
   SUBMIT FORM
===================================================== */

const pendudukForm =
  document.getElementById(
    "pendudukForm"
  );


if (pendudukForm) {

  pendudukForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      let data;


      try {

        data =
          ambilDataForm();

      } catch (error) {

        showToast(
          error.message
        );

        return;
      }


      /*
        MODE EDIT
      */

      if (
        editMode &&
        editId
      ) {

        try {

          const result =
            await apiPost({

              action: "update",

              idPenduduk:
                editId,

              data:
                data

            });


          showToast(
            result.message ||
            "Data berhasil diperbarui."
          );


          keluarModeEdit();


          loadDashboard();

          loadPenduduk(
            currentPage
          );


          showPage(
            "penduduk"
          );


        } catch (error) {

          showToast(
            error.message
          );

        }

        return;
      }


      /*
        MODE TAMBAH
      */

      try {

        const result =
          await apiPost({

            action: "create",

            data:
              data

          });


        showToast(
          result.message ||
          "Data berhasil disimpan."
        );


        pendudukForm.reset();


        loadDashboard();

        currentPage = 1;

        loadPenduduk(1);


        showPage(
          "penduduk"
        );


      } catch (error) {

        showToast(
          error.message
        );

      }

    }
  );

}


/* =====================================================
   EDIT PENDUDUK
===================================================== */

async function editPenduduk(
  id
) {

  if (!id) {

    showToast(
      "ID penduduk tidak ditemukan."
    );

    return;
  }


  try {

    showToast(
      "Mengambil data penduduk..."
    );


    const result =
      await apiGet({

        action: "get",

        idPenduduk:
          id

      });


    const data =
      result.data;


    if (!data) {

      throw new Error(
        "Data penduduk tidak ditemukan."
      );
    }


    /*
      Isi form
    */

    setFormValue(
      "noKK",
      data.noKK
    );

    setFormValue(
      "nik",
      data.nik
    );

    setFormValue(
      "namaLengkap",
      data.namaLengkap
    );

    setFormValue(
      "jenisKelamin",
      data.jenisKelamin
    );

    setFormValue(
      "tempatLahir",
      data.tempatLahir
    );

    setFormValue(
      "tanggalLahir",
      normalisasiTanggal(
        data.tanggalLahir
      )
    );

    setFormValue(
      "agama",
      data.agama
    );

    setFormValue(
      "pendidikan",
      data.pendidikan
    );

    setFormValue(
      "jenisPekerjaan",
      data.jenisPekerjaan
    );

    setFormValue(
      "statusPerkawinan",
      data.statusPerkawinan
    );

    setFormValue(
      "statusHubunganKeluarga",
      data.statusHubunganKeluarga
    );

    setFormValue(
      "kewarganegaraan",
      data.kewarganegaraan
    );

    setFormValue(
      "alamat",
      data.alamat
    );

    setFormValue(
      "rt",
      data.rt
    );

    setFormValue(
      "rw",
      data.rw
    );


    /*
      Aktifkan mode edit
    */

    editMode = true;

    editId = id;


    ubahTampilanFormEdit();


    /*
      Pindah ke halaman registrasi
    */

    showPage(
      "registrasi"
    );


    /*
      Scroll ke atas
    */

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


  } catch (error) {

    console.error(error);

    showToast(
      error.message
    );

  }
}


/* =====================================================
   SET FORM VALUE
===================================================== */

function setFormValue(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {
    return;
  }


  element.value =
    value ?? "";
}


/* =====================================================
   NORMALISASI TANGGAL
===================================================== */

function normalisasiTanggal(
  value
) {

  if (!value) {
    return "";
  }


  /*
    Jika sudah YYYY-MM-DD
  */

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {

    return value;
  }


  /*
    Coba parsing tanggal
  */

  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";
  }


  const tahun =
    date.getFullYear();


  const bulan =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const hari =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${tahun}-${bulan}-${hari}`;
}


/* =====================================================
   TAMPILAN MODE EDIT
===================================================== */

function ubahTampilanFormEdit() {

  const form =
    document.getElementById(
      "pendudukForm"
    );


  if (!form) {
    return;
  }


  /*
    Ubah tombol submit
  */

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );


  if (submitButton) {

    submitButton.textContent =
      "Simpan Perubahan";
  }


  /*
    Tambahkan tombol batal
    jika belum ada.
  */

  let cancelButton =
    document.getElementById(
      "btnBatalEdit"
    );


  if (!cancelButton) {

    cancelButton =
      document.createElement(
        "button"
      );

    cancelButton.id =
      "btnBatalEdit";

    cancelButton.type =
      "button";

    cancelButton.className =
      "btn-secondary";

    cancelButton.textContent =
      "Batal Edit";

    cancelButton.addEventListener(
      "click",
      keluarModeEdit
    );


    if (submitButton) {

      submitButton.parentElement
        .appendChild(
          cancelButton
        );

    } else {

      form.appendChild(
        cancelButton
      );
    }
  }


  /*
    Cari judul form jika tersedia.
  */

  const heading =
    form.querySelector(
      "h2"
    );


  if (heading) {

    heading.textContent =
      "Edit Data Penduduk";
  }
}


/* =====================================================
   KELUAR MODE EDIT
===================================================== */

function keluarModeEdit() {

  editMode = false;

  editId = null;


  const form =
    document.getElementById(
      "pendudukForm"
    );


  if (form) {

    form.reset();
  }


  const submitButton =
    form
      ? form.querySelector(
          'button[type="submit"]'
        )
      : null;


  if (submitButton) {

    submitButton.textContent =
      "Simpan";
  }


  const cancelButton =
    document.getElementById(
      "btnBatalEdit"
    );


  if (cancelButton) {

    cancelButton.remove();
  }


  const heading =
    form
      ? form.querySelector(
          "h2"
        )
      : null;


  if (heading) {

    heading.textContent =
      "Registrasi Penduduk";
  }
}


/* =====================================================
   HAPUS PENDUDUK
===================================================== */

async function hapusPenduduk(
  id
) {

  if (!id) {

    showToast(
      "ID penduduk tidak ditemukan."
    );

    return;
  }


  const yakin =
    confirm(
      "Apakah Anda yakin ingin menghapus data penduduk ini?\n\nData yang dihapus tidak dapat dikembalikan."
    );


  if (!yakin) {
    return;
  }


  try {

    const result =
      await apiPost({

        action: "delete",

        idPenduduk:
          id

      });


    showToast(
      result.message ||
      "Data berhasil dihapus."
    );


    loadPenduduk(
      currentPage
    );

    loadDashboard();


  } catch (error) {

    showToast(
      error.message
    );

  }
}


/* =====================================================
   NAVIGASI
===================================================== */

function showPage(
  page
) {

  document
    .querySelectorAll(
      ".page"
    )
    .forEach(
      element => {

        element.classList.remove(
          "active"
        );

      }
    );


  const selected =
    document.getElementById(
      `page-${page}`
    );


  if (selected) {

    selected.classList.add(
      "active"
    );
  }


  document
    .querySelectorAll(
      ".menu"
    )
    .forEach(
      menu => {

        menu.classList.remove(
          "active"
        );


        if (
          menu.dataset.page ===
          page
        ) {

          menu.classList.add(
            "active"
          );
        }

      }
    );


  const titles = {

    dashboard:
      "Dashboard",

    penduduk:
      "Data Penduduk",

    registrasi:
      editMode
        ? "Edit Data Penduduk"
        : "Registrasi Penduduk",

    keluarga:
      "Data Keluarga"

  };


  const pageTitle =
    document.getElementById(
      "pageTitle"
    );


  if (pageTitle) {

    pageTitle.textContent =
      titles[page] ||
      "Dashboard";
  }


  if (
    page === "penduduk"
  ) {

    loadPenduduk(
      currentPage
    );
  }


  if (
    page === "dashboard"
  ) {

    loadDashboard();
  }

}


/* =====================================================
   MENU
===================================================== */

document
  .querySelectorAll(
    ".menu"
  )
  .forEach(
    menu => {

      menu.addEventListener(
        "click",
        () => {

          showPage(
            menu.dataset.page
          );

        }
      );

    }
  );


/* =====================================================
   ENTER PENCARIAN
===================================================== */

const searchInput =
  document.getElementById(
    "searchInput"
  );


if (searchInput) {

  searchInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        cariPenduduk();

      }

    }
  );

}


/* =====================================================
   TOMBOL CARI
===================================================== */

const searchButton =
  document.getElementById(
    "btnCari"
  );


if (searchButton) {

  searchButton.addEventListener(
    "click",
    cariPenduduk
  );

}


/* =====================================================
   START APLIKASI
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    checkApi();

    loadDashboard();

    loadPenduduk(1);

  }
);
