import React from 'react';
import { Typography } from '@mui/material';
import Image from 'next/image';
import styles from './infocard.module.css';

interface InfoCardProps {
  startDate: string;
  endDate?: string;
  yearsSpent: number;
  companyName: string;
  location: string;
  imageSrc: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  startDate,
  endDate,
  yearsSpent,
  companyName,
  location,
  imageSrc,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.textContainer}>
        <Typography variant="body2">
          {endDate ? `${startDate} - ${endDate}` : `${startDate} - Present`} (~
          {yearsSpent} years)
        </Typography>
        <Typography variant="body2">{location}</Typography>
        <Typography variant="h5">{companyName}</Typography>
      </div>
      <div className={styles.imageContainer}>
        <Image
          src={imageSrc}
          alt={companyName}
          className={styles.image}
          fill
          sizes="200px"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
};

export default InfoCard;
