const API_URL = "/api/penduduk";


/* =====================================================
   UTILITAS
===================================================== */

function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.textContent =
    message;

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
   API REQUEST
===================================================== */

async function apiGet(params = {}) {

  const query =
    new URLSearchParams(params);


  const response =
    await fetch(
      `${API_URL}?${query.toString()}`
    );


  const result =
    await response.json();


  if (!result.success) {

    throw new Error(
      result.message ||
      "Request gagal."
    );

  }


  return result;

}



async function apiPost(payload) {

  const response =
    await fetch(
      API_URL,
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json"

        },

        body:
          JSON.stringify(payload)

      }
    );


  const result =
    await response.json();


  if (!result.success) {

    throw new Error(
      result.message ||
      "Request gagal."
    );

  }


  return result;

}


/* =====================================================
   CEK API
===================================================== */

async function checkApi() {

  const dot =
    document.getElementById(
      "apiStatus"
    );

  const text =
    document.getElementById(
      "apiStatusText"
    );


  try {

    const result =
      await apiGet({
        action: "health"
      });


    if (result.success) {

      dot.style.background =
        "#22c55e";

      text.textContent =
        "API Terhubung";

    }

  } catch (error) {

    dot.style.background =
      "#ef4444";

    text.textContent =
      "API Tidak Terhubung";

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
      result.data;


    document.getElementById(
      "totalPenduduk"
    ).textContent =
      stats.totalPenduduk || 0;


    document.getElementById(
      "totalLaki"
    ).textContent =
      stats.lakiLaki || 0;


    document.getElementById(
      "totalPerempuan"
    ).textContent =
      stats.perempuan || 0;


    document.getElementById(
      "totalKK"
    ).textContent =
      stats.totalKK || 0;


  } catch (error) {

    console.error(error);

  }

}


/* =====================================================
   LOAD DATA PENDUDUK
===================================================== */

async function loadPenduduk() {

  const table =
    document.getElementById(
      "pendudukTable"
    );


  table.innerHTML = `

    <tr>

      <td colspan="9" class="loading">

        Memuat data...

      </td>

    </tr>

  `;


  try {

    const search =
      document.getElementById(
        "searchInput"
      ).value.trim();


    const result =
      await apiGet({

        action: "list",

        q: search,

        page: 1,

        limit: 100

      });


    renderPenduduk(
      result.data
    );


  } catch (error) {

    table.innerHTML = `

      <tr>

        <td
          colspan="9"
          class="loading"
        >

          ${escapeHtml(
            error.message
          )}

        </td>

      </tr>

    `;

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


  if (!data || data.length === 0) {

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


  table.innerHTML =
    data.map((item, index) => `

      <tr>

        <td>
          ${index + 1}
        </td>

        <td>
          ${escapeHtml(item.nik)}
        </td>

        <td>
          ${escapeHtml(item.noKK)}
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
            onclick="editPenduduk('${escapeHtml(
              item.idPenduduk
            )}')"
          >
            Edit
          </button>

          <button
            class="btn-secondary"
            onclick="hapusPenduduk('${escapeHtml(
              item.idPenduduk
            )}')"
          >
            Hapus
          </button>

        </td>

      </tr>

    `).join("");

}


/* =====================================================
   TAMBAH PENDUDUK
===================================================== */

document
  .getElementById("pendudukForm")
  .addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const noKK =
        document
          .getElementById("noKK")
          .value.trim();


      const nik =
        document
          .getElementById("nik")
          .value.trim();


      /* VALIDASI KK */

      if (!/^\d{16}$/.test(noKK)) {

        showToast(
          "No. KK harus tepat 16 digit."
        );

        return;

      }


      /* VALIDASI NIK */

      if (!/^\d{16}$/.test(nik)) {

        showToast(
          "NIK harus tepat 16 digit."
        );

        return;

      }


      const data = {

        noKK,

        nik,

        namaLengkap:
          document
            .getElementById(
              "namaLengkap"
            )
            .value.trim(),

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
            .value.trim(),

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
            .value.trim(),

        jenisPekerjaan:
          document
            .getElementById(
              "jenisPekerjaan"
            )
            .value.trim(),

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
            .value.trim(),

        alamat:
          document
            .getElementById(
              "alamat"
            )
            .value.trim(),

        rt:
          document
            .getElementById(
              "rt"
            )
            .value.trim(),

        rw:
          document
            .getElementById(
              "rw"
            )
            .value.trim(),

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


      try {

        const result =
          await apiPost({

            action: "create",

            data

          });


        showToast(
          result.message
        );


        document
          .getElementById(
            "pendudukForm"
          )
          .reset();


        loadDashboard();

        loadPenduduk();

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


/* =====================================================
   HAPUS
===================================================== */

async function hapusPenduduk(id) {

  const yakin =
    confirm(
      "Apakah Anda yakin ingin menghapus data penduduk ini?"
    );


  if (!yakin) {
    return;
  }


  try {

    const result =
      await apiPost({

        action: "delete",

        idPenduduk: id

      });


    showToast(
      result.message
    );


    loadPenduduk();

    loadDashboard();


  } catch (error) {

    showToast(
      error.message
    );

  }

}


/* =====================================================
   EDIT
===================================================== */

function editPenduduk(id) {

  showToast(
    "Fitur edit lengkap akan kita aktifkan pada tahap berikutnya."
  );

}


/* =====================================================
   NAVIGASI
===================================================== */

function showPage(page) {

  document
    .querySelectorAll(".page")
    .forEach(element => {

      element.classList.remove(
        "active"
      );

    });


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
    .querySelectorAll(".menu")
    .forEach(menu => {

      menu.classList.remove(
        "active"
      );


      if (
        menu.dataset.page === page
      ) {

        menu.classList.add(
          "active"
        );

      }

    });


  const titles = {

    dashboard:
      "Dashboard",

    penduduk:
      "Data Penduduk",

    registrasi:
      "Registrasi Penduduk",

    keluarga:
      "Data Keluarga"

  };


  document.getElementById(
    "pageTitle"
  ).textContent =
    titles[page] ||
    "Dashboard";


  if (page === "penduduk") {

    loadPenduduk();

  }


  if (page === "dashboard") {

    loadDashboard();

  }

}


/* =====================================================
   MENU
===================================================== */

document
  .querySelectorAll(".menu")
  .forEach(menu => {

    menu.addEventListener(
      "click",
      () => {

        showPage(
          menu.dataset.page
        );

      }
    );

  });


/* =====================================================
   ENTER PENCARIAN
===================================================== */

document
  .getElementById(
    "searchInput"
  )
  .addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        loadPenduduk();

      }

    }
  );


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    checkApi();

    loadDashboard();

  }
);
