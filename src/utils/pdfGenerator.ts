import { Project } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = async (project: Project) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text(project.name, 20, 20);

  // Add creation date
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);

  // Prepare objectives data
  const tableData = project.objectives.map(obj => [
    obj.category,
    obj.verb,
    obj.description,
    obj.parentId ? 'Sub-objective' : 'Main objective'
  ]);

  // Add objectives table
  doc.autoTable({
    startY: 40,
    head: [['Category', 'Verb', 'Description', 'Type']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Save the PDF
  doc.save(`${project.name.toLowerCase().replace(/\s+/g, '-')}-syllabus.pdf`);
};