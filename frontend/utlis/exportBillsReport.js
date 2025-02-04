function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
      throw new Error("Invalid date");
    }
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

// Export utility functions
const generateExcelData = (data, activeTab) => {
    let headers = [];
    
    // Define headers based on active tab
    switch (activeTab) {
      case 'ipdReport':
        headers = ['Date', 'Type', 'Patient Name', 'UHID', 'Mobile', 'Doctor', 'Patient Type', 'Amount'];
        break;
      case 'opdReport':
        headers = ['Date', 'Type', 'Patient Name', 'UHID', 'Patient Type', 'Doctor', 'Amount'];
        break;
      case 'pharmacyReport':
      case 'labReport':
        headers = ['Date', 'Patient Name', 'UHID', 'Mode', 'Doctor', 'Amount'];
        break;
      case 'miscReport':
        headers = ['Date', 'Head', 'Details', 'Time', 'Mode', 'Amount'];
        break;
      case 'supplierReport':
        headers = ['Date', 'Supplier Name', 'Supplier Bill Number', 'Total Medicine', 'Mode', 'Amount'];
        break;
      default:
        headers = [];
    }
  
    // Map data to rows based on active tab
    const rows = data.items.map(item => {
      switch (activeTab) {
        case 'ipdReport':
          return [
            formatDateToDDMMYYYY(item.date),
            item.billType,
            item.patientName,
            item.uhid || '-',
            item.mobile || '-',
            item.referenceDoctor || '-',
            item.patientPaymentType,
            item.amount
          ];
        case 'opdReport':
          return [
            formatDateToDDMMYYYY(item.date),
            item.billType,
            item.patientName,
            item.uhid || '-',
            item.patientPaymentType || '-',
            item.referenceDoctor || '-',
            item.amount
          ];
        case 'pharmacyReport':
        case 'labReport':
          return [
            formatDateToDDMMYYYY(item.date),
            item.patientName,
            item.uhid || '-',
            item.mode || '-',
            item.prescribedByName || '-',
            item.amount
          ];
        case 'miscReport':
          return [
            formatDateToDDMMYYYY(item.date),
            item.head,
            item.details,
            item.time,
            item.mode,
            item.amount
          ];
        case 'supplierReport':
          return [
            formatDateToDDMMYYYY(item.billDate),
            item.supplierName,
            item.supplierBillNumber,
            item.totalMed,
            item.mode,
            item.amount
          ];
        default:
          return [];
      }
    });
  
    return { headers, rows };
  };
  
  export const exportToExcel = (data, activeTab) => {
    const { headers, rows } = generateExcelData(data, activeTab);
    
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      
      // Generate file name with date
      const fileName = `${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    });
  };
  
  export const exportToCSV = (data, activeTab) => {
    const { headers, rows } = generateExcelData(data, activeTab);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fileName = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }
  };
  
  export const exportToPDF = (data, activeTab) => {
    const { headers, rows } = generateExcelData(data, activeTab);
    
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(16);
        doc.text(`${activeTab.replace('Report', '')} Report`, 14, 15);
        
        // Add date range
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
        
        // Add table
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: 35,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 1.5,
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [71, 71, 71],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center'
          }
        });
        
        const fileName = `${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      });
    });
  };