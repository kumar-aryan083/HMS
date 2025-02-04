// ItemWiseExportUtils.js
const generateItemWiseData = (items) => {
    const headers = [
      'Bill Number',
      'Type',
      'Patient Name',
      'Item Name',
      'Charge',
      'Quantity',
      'Total',
      'Discount(%)',
      'Total Charge'
    ];
  
    const rows = items.map(item => [
      item.billNumber,
      item.billType,
      item.patientName,
      item.itemName,
      item.charge,
      item.quantity,
      item.total,
      item.discount,
      item.totalCharge
    ]);
  
    // Add total row
    const totalAmount = items.reduce((sum, item) => sum + item.totalCharge, 0);
    const totalRow = Array(headers.length - 1).fill('').concat([totalAmount]);
    rows.push(totalRow);
  
    return { headers, rows };
  };
  
  export const exportItemWiseToExcel = (items, activeTab) => {
    const { headers, rows } = generateItemWiseData(items);
    
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, activeTab);
      
      // Generate file name
      const fileName = `ItemWise_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    });
  };
  
  export const exportItemWiseToCSV = (items, activeTab) => {
    const { headers, rows } = generateItemWiseData(items);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fileName = `ItemWise_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }
  };
  
  export const exportItemWiseToPDF = (items, activeTab) => {
    const { headers, rows } = generateItemWiseData(items);
    
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF('landscape');
        
        // Add title
        doc.setFontSize(16);
        doc.text(`Item Wise Report - ${activeTab.toUpperCase()}`, 14, 15);
        
        // Add date range info
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
        
        const fileName = `ItemWise_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      });
    });
  };