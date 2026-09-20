export default async function handler(req, res) {

  const scriptUrl =
    process.env.APPS_SCRIPT_URL;

  const apiKey =
    process.env.APPS_SCRIPT_API_KEY;


  if (!scriptUrl || !apiKey) {

    return res.status(500).json({
      success: false,
      message:
        "Konfigurasi API belum tersedia di Vercel."
    });

  }


  try {

    /*
     * =========================================
     * GET
     * =========================================
     */

    if (req.method === "GET") {

      const params =
        new URLSearchParams(req.query || {});


      params.set(
        "apiKey",
        apiKey
      );


      const url =
        `${scriptUrl}?${params.toString()}`;


      const response =
        await fetch(url);


      const text =
        await response.text();


      let data;


      try {

        data =
          JSON.parse(text);

      } catch {

        return res.status(502).json({

          success: false,

          message:
            "Apps Script mengembalikan respons yang tidak valid.",

          raw:
            text.substring(0, 500)

        });

      }


      return res.status(
        response.ok ? 200 : response.status
      ).json(data);

    }



    /*
     * =========================================
     * POST
     * =========================================
     */

    if (req.method === "POST") {

      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body;


      const payload = {

        action:
          body.action,

        apiKey:
          apiKey,

        data:
          body.data || {},

        idPenduduk:
          body.idPenduduk,

        nik:
          body.nik

      };


      const response =
        await fetch(scriptUrl, {

          method: "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify(payload)

        });


      const text =
        await response.text();


      let data;


      try {

        data =
          JSON.parse(text);

      } catch {

        return res.status(502).json({

          success: false,

          message:
            "Apps Script mengembalikan respons yang tidak valid.",

          raw:
            text.substring(0, 500)

        });

      }


      return res.status(
        response.ok ? 200 : response.status
      ).json(data);

    }



    return res.status(405).json({

      success: false,

      message:
        "Method tidak didukung."

    });


  } catch (error) {

    console.error(error);


    return res.status(500).json({

      success: false,

      message:
        "Terjadi kesalahan komunikasi dengan server."

    });

  }

}
