import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  async function getSignedUrl(fileName: string) {
    const response = await fetch(`/import?name=${fileName}`, { method: "GET" });
    const data = await response.json();
    return data.url;
  }

  async function uploadFile(file: File) {
    const signedUrl = await getSignedUrl(file.name);
    await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": "text/csv" },
      body: file,
    });
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={() => uploadFile(file)}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
