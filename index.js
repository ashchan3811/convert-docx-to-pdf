const express = require('express');
const path = require('path');
const fs = require('fs');

const docxConverter = require('docx-pdf');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
const port = 3010;

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages/index.html'));
});

app.post('/convert', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.json(`missing file`);
  }

  const filename = file.originalname;
  const parsedName = path.parse(filename);
  let fileNameWithoutExt = parsedName.name;

  fs.writeFile(
    path.resolve(__dirname, 'files', filename),
    file.buffer,
    async (err) => {
      if (err) {
        return res.json(`Error writing file: ${err}`);
      } else {
        const inputPath = path.resolve(__dirname, 'files', `${filename}`);
        const outputPath = path.resolve(
          __dirname,
          'files',
          `${fileNameWithoutExt}.pdf`
        );

        docxConverter(inputPath, outputPath, function (err, result) {
          if (err) {
            return res.json(`Error converting file: ${err}`);
          } else {
            res.status(200).json({ path: outputPath });
          }
        });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
