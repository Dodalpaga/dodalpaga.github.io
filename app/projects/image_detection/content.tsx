import * as React from 'react';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Image from 'next/image';
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import styles from './styles.module.css'; // Import the CSS module

export default function Content() {
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [processedImage, setProcessedImage] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [modelName, setModelName] = React.useState<string>('yolov8l.pt');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = () => {
    if (!uploadedImage) {
      console.warn('No image uploaded.');
      return;
    }

    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_IMG_DETECTION}` +
        `?model_name=${modelName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        mode: 'cors',
        body: JSON.stringify({ base64_image: uploadedImage }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setProcessedImage(data.base64_image);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Stack
        spacing={2}
        className={`${styles.container} ${styles.flex} ${styles['flex-col']} ${styles['items-center']} ${styles['justify-center']}`}
        direction="row"
        id={styles['buttons-stack']}
      >
        <FormControl
          variant="outlined"
          sx={{
            minWidth: 120,
            height: '100%',
          }}
        >
          <InputLabel id="model-select-label">Model</InputLabel>
          <Select
            labelId="model-select-label"
            value={modelName}
            onChange={(event) => setModelName(event.target.value)}
            label="Model"
            sx={{
              minWidth: 120,
              height: '100%',
            }}
          >
            <MenuItem value="yolov8n.pt">YOLOv8n</MenuItem>
            <MenuItem value="yolov8s.pt">YOLOv8s</MenuItem>
            <MenuItem value="yolov8m.pt">YOLOv8m</MenuItem>
            <MenuItem value="yolov8l.pt">YOLOv8l</MenuItem>
            <MenuItem value="yolov8x.pt">YOLOv8x</MenuItem>
          </Select>
          <FormHelperText id="my-helper-text">
            Select the detection model
          </FormHelperText>
        </FormControl>

        <Button
          variant="contained"
          component="label"
          style={{
            minWidth: 120,
            height: '100%',
          }}
        >
          Upload
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </Button>

        <Button
          variant="contained"
          onClick={handleProcessImage}
          disabled={!uploadedImage}
          sx={{
            minWidth: 120,
            height: '100%',
          }}
        >
          Process
        </Button>
      </Stack>

      <Stack
        spacing={2}
        className={`${styles.container} ${styles['flex-col']} ${styles['items-center']} ${styles['justify-between']} ${styles.p4}`}
        direction="row"
        id={styles['images-stack']}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'calc(100% - 250px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {uploadedImage ? (
            <Image
              src={uploadedImage}
              alt="Uploaded Image"
              width={0}
              height={0}
              sizes="100%"
              style={{
                height: 'auto',
                width: 'auto',
                maxHeight: '100%',
                maxWidth: '100%',
              }}
            />
          ) : (
            <div>No image uploaded</div>
          )}
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : processedImage ? (
            <Image
              src={processedImage}
              alt="Processed Image"
              width={0}
              height={0}
              sizes="100%"
              style={{
                height: 'auto',
                width: 'auto',
                maxHeight: '100%',
                maxWidth: '100%',
              }}
            />
          ) : (
            <div>No processed image</div>
          )}
        </div>
      </Stack>
    </Container>
  );
}
