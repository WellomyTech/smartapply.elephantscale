// pages/api/latex-to-pdf.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { writeFileSync, unlinkSync } from 'fs';
import { exec } from 'child_process';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { latex } = req.body;

  const tempDir = '/tmp';
  const texPath = path.join(tempDir, 'document.tex');
  const pdfPath = path.join(tempDir, 'document.pdf');

  try {
    writeFileSync(texPath, latex);

    exec(`pdflatex -output-directory=${tempDir} ${texPath}`, (error) => {
      if (error) {
        return res.status(500).json({ error: 'LaTeX compile error', details: error.message });
      }

      const pdf = require('fs').readFileSync(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
      res.send(pdf);

      // Cleanup
      unlinkSync(texPath);
      unlinkSync(pdfPath);
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
