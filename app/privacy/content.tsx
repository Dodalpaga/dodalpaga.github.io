// app/privacy/content.tsx

'use client';
import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export default function PrivacyPolicy() {
  const { hasConsent, giveConsent, denyConsent, withdrawConsent } =
    useCookieConsent();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6, minHeight: '100vh' }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Privacy Policy & GDPR Compliance
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Last updated: {new Date().toLocaleDateString()}
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* Introduction */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 'bold', mt: 3 }}
        >
          1. Introduction
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This portfolio website (Site) is committed to protecting your privacy
          and ensuring you have a positive experience on our platform. This
          Privacy Policy explains how I collect, use, disclose, and safeguard
          your information in accordance with the General Data Protection
          Regulation (GDPR) and other applicable laws.
        </Typography>
      </Box>

      {/* Analytics & Tracking */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 'bold', mt: 3 }}
        >
          2. Analytics & Tracking Data
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>What I collect:</strong>
        </Typography>
        <Typography component="div" sx={{ ml: 2, mb: 2 }}>
          <ul>
            <li>Your IP address (anonymized and geolocated)</li>
            <li>Pages visited and time spent on each page</li>
            <li>Device type and browser information</li>
            <li>Geographic location (country, city, region)</li>
            <li>ISP (Internet Service Provider) information</li>
            <li>Referring website</li>
          </ul>
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Why I collect this data:</strong>
        </Typography>
        <Typography component="div" sx={{ ml: 2, mb: 2 }}>
          <ul>
            <li>To understand how users interact with the Site</li>
            <li>To improve website functionality and user experience</li>
            <li>To identify technical issues and performance bottlenecks</li>
            <li>To monitor website security</li>
          </ul>
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Legal basis (GDPR Article 6):</strong> Consent - I only
          collect this data after you have explicitly consented via our cookie
          banner.
        </Typography>
      </Box>

      {/* Data Storage & Retention */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 'bold', mt: 3 }}
        >
          3. Data Storage & Retention
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Where I store data:</strong> Analytics data is stored on our
          backend server hosted on Render (https://render.com), a service
          provider certified for GDPR compliance.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>How long I retain data:</strong> Analytics data is retained
          for a maximum of 90 days. After this period, data is automatically
          deleted.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Data security:</strong> I implement industry-standard security
          measures including encryption and secure access controls to protect
          your data.
        </Typography>
      </Box>

      {/* Your Rights */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 'bold', mt: 3 }}
        >
          4. Your GDPR Rights
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Under the GDPR, you have the following rights:
        </Typography>
        <Typography component="div" sx={{ ml: 2, mb: 2 }}>
          <ul>
            <li>
              <strong>Right to Access:</strong> Request a copy of the personal
              data I hold about you
            </li>
            <li>
              <strong>Right to Rectification:</strong> Request correction of
              inaccurate data
            </li>
            <li>
              <strong>Right to Erasure:</strong> Request deletion of your data
              (Right to be Forgotten)
            </li>
            <li>
              <strong>Right to Restrict Processing:</strong> Limit how I use
              your data
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Withdraw analytics
              consent at any time
            </li>
            <li>
              <strong>Right to Data Portability:</strong> Receive your data in a
              structured format
            </li>
            <li>
              <strong>Right to Object:</strong> Object to certain processing
              activities
            </li>
          </ul>
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          To exercise any of these rights, please contact us at{' '}
          <Link href="mailto:dorian.voydie@gmail.com" underline="hover">
            dorian.voydie@gmail.com
          </Link>
        </Typography>
      </Box>

      {/* Cookies & Consent */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 'bold', mt: 3 }}
        >
          5. Cookies & Consent Management
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>What are cookies?</strong> Cookies are small text files stored
          on your device that help us remember your preferences and track
          analytics.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Our cookie policy:</strong>
        </Typography>
        <Typography component="div" sx={{ ml: 2, mb: 2 }}>
          <ul>
            <li>I only set analytics cookies after you consent</li>
            <li>I do not use third-party tracking cookies</li>
            <li>
              You can withdraw consent at any time using the cookie banner
            </li>
            <li>You can clear cookies from your browser settings</li>
          </ul>
        </Typography>

        {isMounted && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Current consent status:</strong>{' '}
            <span
              style={{
                color: hasConsent ? '#4caf50' : '#f44336',
                fontWeight: 'bold',
              }}
            >
              {hasConsent ? '✓ Analytics Enabled' : '✗ Analytics Disabled'}
            </span>
          </Typography>
        )}

        {isMounted && hasConsent && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={withdrawConsent}>
              Withdraw Consent
            </Button>
          </Box>
        )}
      </Box>

      {/* Third Party Services */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 'bold', mt: 3 }}
        >
          6. Third-Party Services
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          I use the following third-party services:
        </Typography>
        <Typography component="div" sx={{ ml: 2, mb: 2 }}>
          <ul>
            <li>
              <strong>ipapi.co:</strong> Geolocation service to identify country
              and city from IP addresses. Data is processed according to their
              privacy policy.
            </li>
            <li>
              <strong>Render:</strong> Backend hosting provider (GDPR compliant)
            </li>
            <li>
              <strong>GitHub Pages:</strong> Frontend hosting provider
            </li>
          </ul>
        </Typography>
      </Box>

      {/* Data Processing */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 'bold', mt: 3 }}
        >
          7. Data Processing Principles
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          I process your data in accordance with the GDPR principles:
        </Typography>
        <Typography component="div" sx={{ ml: 2, mb: 2 }}>
          <ul>
            <li>
              <strong>Lawfulness:</strong> Processing is based on your explicit
              consent
            </li>
            <li>
              <strong>Fairness:</strong> I am transparent about our data
              collection
            </li>
            <li>
              <strong>Transparency:</strong> This privacy policy clearly
              explains our practices
            </li>
            <li>
              <strong>Purpose Limitation:</strong> Data is only used for
              analytics improvements
            </li>
            <li>
              <strong>Data Minimization:</strong> I collect only necessary
              information
            </li>
            <li>
              <strong>Accuracy:</strong> I maintain accurate records
            </li>
            <li>
              <strong>Storage Limitation:</strong> Data is retained for maximum
              90 days
            </li>
            <li>
              <strong>Integrity & Confidentiality:</strong> Data is securely
              protected
            </li>
          </ul>
        </Typography>
      </Box>

      {/* Contact & Complaints */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 'bold', mt: 3 }}
        >
          8. Contact & Data Protection Authority
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Data Controller:</strong> Dorian VOYDIE
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Contact Email:</strong>{' '}
          <Link href="mailto:dorian.voydie@gmail.com" underline="hover">
            dorian.voydie@gmail.com
          </Link>
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Portfolio:</strong>{' '}
          <Link
            href="https://dodalpaga.github.io"
            target="_blank"
            underline="hover"
          >
            https://dodalpaga.github.io
          </Link>
        </Typography>

        <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
          <strong>Data Protection Authority:</strong> If you believe I have
          violated your GDPR rights, please contact me.
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 4 }}>
        This privacy policy is effective as of {new Date().toLocaleDateString()}{' '}
        and may be updated periodically. I encourage you to review this page
        regularly for any changes.
      </Typography>
    </Container>
  );
}
