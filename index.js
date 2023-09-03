require("dotenv").config();
const students = require("./models/student.model");
const mentors = require("./models/mentor.model");
const mongoose = require("mongoose");

const express = require("express");

const app = express();
app.use(express.json());

const URL = process.env.MONGO_URL;

const db = async () => {
  try {
    await mongoose.connect(URL).then(() => {
      console.log("DB is connected");
    });
  } catch (error) {
    console.log("error while connecting DB");
  }
};

db();

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello How ARe You???");
});

//get all the students

app.get("/students", (req, res) => {
  try {
    students
      .find()
      .then((data) => {
        res.status(200).send({
          message: "Students have been retrieved successfully",
          data: data,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: "Error while retrieving Users data.",
          error: error,
        });
      });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        message: "Internal Server Error",

        error: error,
      });
  }
});
//get all the mentors
app.get("/mentors", (req, res) => {
  try {
    mentors
      .find()
      .then((data) => {
        res.status(200).send({
          message: "Mentor has been retrived succesfully",
          data: data,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: "Error while retrieving Mentor Data.",
          error: error,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal Server Error",
      err: err,
    });
  }
});

//create a new Student
app.post("/createStudent", (req, res) => {
  try {
    const student = students
      .create(req.body)
      .then((data) => {
        res.status(201).send({
          message: "student has been created succesfully",
          data: data,
        });
      })
      .catch((err) => {
        res.status(400).send({
          message: "Failed to create student",
          err: err.message,
        });
      });
  } catch (error) {
    console.log(error);
  }
});

//create a mentor
app.post("/createMentor", (req, res) => {
  try {
    const mentor = mentors
      .create(req.body)
      .then((data) => {
        res.status(201).send({
          message: "Mentor created Successfully",
          data: data,
        });
      })
      .catch((err) => {
        res
          .status(400)
          .send({ message: "Failed to create Mentor", error: err.message });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal server Error",
      error: error,
    });
  }
});

//Assign a student to Mentor
app.put("/student/:studentId/mentor/:mentorId", async (req, res) => {
  try {
    const { studentId, mentorId } = req.params;
    const student = await students
      .findByIdAndUpdate(
        { _id: studentId },
        { $set: { mentor: mentorId } },
        { new: true }
      )
      .then((data) => {
        res.status(201).send({
          message: "Student details updated Successfully",
          data: data,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: "failed to update the Student",
          error: error.message,
        });
      });
  } catch (error) {
    res.status(500).send({
      error: error,
    });
  }
});

//select one mentor and add multiple students
app.post("/mentor/:mentorId/students", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const studentIds = req.body;
    const mentor = await mentors.findById(mentorId);
    mentor.students.push(...studentIds);
    await mentor.save();
    await students.updateMany(
      { _id: studentIds },
      { $set: { mentor: mentorId } }
    );
    await mentors
      .findById(mentorId)
      .then((data) => {
        res.status(201).send({
          message: "Mentor has updated Successfully",
          mentor: data,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: "Failed to find mentor",
          Error: error,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
});

//get all students for a particular mentor
app.get("/mentor/:mentorId/students", async (req, res) => {
  try {
    const { mentorId } = req.params;
    console.log("mentor id is ", mentorId);
    const mentor = await mentors.findById(mentorId);
    const student = await students
      .find({ mentor: mentorId })
      .then((data) => {
        res.status(200).send({
          message: "Students Retrieved Sucessfully",
          data: data,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: "Error in retrieving Students",
          error: error.message,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
});

//get student who's mentor is not assigned
app.get("/students/nomentor", async (req, res) => {
  try {
    const student = await students
      .find({
        mentor: null,
      })
      .then((data) => {
        res.status(200).send({
          message: "student with no mentor retrieved",
          Student: data,
        });
      })
      .catch((error) => {
        res.status(401).send({
          message: "No Students found",
          error: error,
        });
      });
  } catch (error) {
    res.status(500).sendStatus({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// get the previously assigned mentor for a particular student.
app.get("/students/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await students.findById(studentId);

    if (!student) {
      return res.status(403).send("Student Not Found");
    }
    const mentorId = student.mentor;
    const mentor = await mentors.findById(mentorId);
    console.log(mentorId);
    if (!mentor) {
      return res.status(406).send("Mentor Not found");
    }
    res.status(201).send({
      message: "fetched previously assigned mentor",
      mentor: mentor,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`App is running on PORT ${PORT}`);
});
