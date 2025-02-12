const Book = require("../models/book");
const fs = require("fs");
//const sharp = require("shrap");

exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userID;
  /* test sharp
   if (!req.file) {
    return res.status(400).json({ message: "Image not found" });
  }

  sharp(req.file.path)
    .resize(500)
    .toFormat("jpeg")
    .jpeg({ quality: 80 })
    .toFile(req.file.destination, "resized", req.file.filename)
    .then(() => {
      fs.unlinkSync(req.file.path);
    })
    .catch((error) => console.log(error));
 
  */
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({
        message: "Post saved successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        if (req.body.author == "") {
          return res.status(400).json({ message: "Author field empty " });
        }
        if (req.body.genre == "") {
          return res.status(400).json({ message: "Genre field empty " });
        }
        if (req.body.title == "") {
          return res.status(400).json({ message: "title field empty " });
        }
        if (req.body.year == "") {
          return res.status(400).json({ message: "year field empty " });
        }

        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Book modify !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Book delete !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.bookRating = (req, res, next) => {
  const userId = req.body.userId;
  const rating = req.body.rating;

  // Vérification des données entrantes
  if (!userId || !rating) {
    return res.status(400).json({ message: "User ID and rating are required" });
  }

  Book.findById(req.params.id)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      // Vérifier si l'utilisateur a déjà noté le livre
      const existingRating = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (existingRating) {
        return res
          .status(400)
          .json({ message: "Book already rated by this user" });
      }

      // Ajouter la nouvelle note
      book.ratings.push({ userId: userId, grade: rating });

      // Recalculer la moyenne des notes
      const totalRatings = book.ratings.length;
      const sumRating = book.ratings.reduce(
        (sum, rating) => sum + rating.grade,
        0
      );
      book.averageRating = Math.round(sumRating / totalRatings);

      // Sauvegarder le livre avec les nouvelles données
      return book.save();
    })
    .then((updatedBook) => res.status(200).json(updatedBook))
    .catch((error) => res.status(500).json({ error }));
};

exports.bestRatingBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Trie par averageRating en ordre decroissant
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(500).json({ error }));
};
