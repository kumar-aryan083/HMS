// ExpensesExportUtils.js
const generateExpensesData = (expenses, activeTab) => {
    let headers = [];
    let rows = [];
  
    switch (activeTab) {
      case 'expenses':
        headers = [
          '#',
          'Expense No.',
          'Expense Head',
          'Details',
          'Amount',
          'Mode',
          'Date of Expense',
          'User'
        ];
        rows = expenses.map((expense, index) => [
          index + 1,
          expense.expenseNo,
          expense.head,
          expense.details,
          expense.amount,
          expense.paymentMode,
          formatDateToDDMMYYYY(expense.date),
          expense.user
        ]);
        break;
  
      case 'supplierBills':
        headers = [
          '#',
          'Bill Number',
          'Supplier Name',
          'Supplier Bill Number',
          'Total Medicines',
          'Total Amount',
          'Bill Date'
        ];
        rows = expenses.map((bill, index) => [
          index + 1,
          bill.billNumber,
          bill.supplierName,
          bill.supplierBillNumber,
          bill.medicines.length,
          bill.totalAmount,
          formatDateToDDMMYYYY(bill.billDate)
        ]);
        break;
  
      case 'storeVendorBills':
        headers = [
          '#',
          'Vendor Name',
          'Purchase Order Number',
          'Total Items',
          'Total Amount',
          'Date'
        ];
        rows = expenses.map((bill, index) => [
          index + 1,
          bill.vendorName,
          bill.purchaseOrderNumber,
          bill.items.length,
          bill.items.reduce((acc, item) => acc + parseFloat(item.finalPrice), 0),
          formatDateToDDMMYYYY(bill.paymentInfo.date)
        ]);
        break;
    }
  
    // Calculate total
    const total = rows.reduce((acc, row) => {
      const amountIndex = activeTab === 'expenses' ? 4 : 
                         activeTab === 'supplierBills' ? 5 : 4;
      return acc + parseFloat(row[amountIndex] || 0);
    }, 0);
  
    // Add total row
    const totalRow = Array(headers.length).fill('');
    totalRow[0] = 'Total';
    totalRow[activeTab === 'expenses' ? 4 : 5] = total;
    rows.push(totalRow);
  
    return { headers, rows };
  };
  
  export const exportExpensesToExcel = (data, activeTab) => {
    const { headers, rows } = generateExpensesData(data, activeTab);
    
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, activeTab);
      
      const fileName = `Expenses_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    });
  };
  
  export const exportExpensesToCSV = (data, activeTab) => {
    const { headers, rows } = generateExpensesData(data, activeTab);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fileName = `Expenses_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }
  };
  
  export const exportExpensesToPDF = (data, activeTab) => {
    const { headers, rows } = generateExpensesData(data, activeTab);
    
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF('landscape');
        
        // Add title
        doc.setFontSize(16);
        doc.text(`Expenses Report - ${activeTab.toUpperCase()}`, 14, 15);
        
        // Add date range info
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
        
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
        
        const fileName = `Expenses_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      });
    });
  };
  
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