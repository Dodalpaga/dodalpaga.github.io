import React from 'react';
import { Typography } from '@mui/material'; // Adjust based on your styling library
import Image from 'next/image';
import styles from './infocard.module.css'; // Create this CSS file for styling

interface InfoCardProps {
  startDate: string;
  endDate?: string; // Optional end date
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
      <Image
        src={imageSrc}
        alt={companyName}
        className={styles.image}
        width={200}
        height={150}
      />
    </div>
  );
};

export default InfoCard;
