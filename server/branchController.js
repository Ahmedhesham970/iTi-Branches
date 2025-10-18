const { sequelize } = require("./db.js");
const branch = require("./userModel.js");
const getallBranches = async (req, res) => {
  try {
    const [rows, metadata] = await sequelize.query(`
      SELECT * FROM public."iTi Branches"
      ORDER BY id ASC
    `);

    res.status(200).json({
      status: "success",
      results: rows.length,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const addBranch = async (req, res) => {
  try {
    let { Branch, X, Y, Tracks } = req.body;

    X = parseFloat(X);
    Y = parseFloat(Y);

    if (isNaN(X) || isNaN(Y)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid coordinates provided",
      });
    }

    const names = await branch.findAndCountAll({
      attributes: ["Branch", "geom"],
    });
    names.rows.forEach((element) => {
      if (element.Branch === Branch) {
        throw new Error("Branch name already exists");
      }
    });

    const geom = { type: "Point", coordinates: [X, Y] };

    const [result] = await sequelize.query(
      `
        INSERT INTO public."iTi Branches" (geom, "Branch", "X", "Y", "Tracks")
        VALUES (ST_GeomFromGeoJSON(:geom), :Branch, :X, :Y, :Tracks)
        RETURNING *;
      `,
      {
        replacements: { geom: JSON.stringify(geom), Branch, X, Y, Tracks },
      }
    );

    res.status(201).json({
      status: "success",
      data: result?.[0] || result,
    });
  } catch (error) {
    console.error("❌ Error inserting branch:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = { getallBranches, addBranch };
