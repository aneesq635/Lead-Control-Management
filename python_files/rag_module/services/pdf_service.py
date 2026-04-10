import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def generate_inventory_pdf(data_rows, output_path):
    """
    data_rows: list of dicts with inventory info
    """
    print("data_rows", data_rows)
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title = Paragraph("Business Inventory & Property Listings", title_style)
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    if not data_rows:
        elements.append(Paragraph("No inventory data provided.", styles['Normal']))
        doc.build(elements)
        return output_path
        
    # Table headers
    headers = list(data_rows[0].keys())
    
    # Table data
    table_data = [headers]
    for row in data_rows:
        table_data.append([str(row.get(h, "")) for h in headers])
        
    t = Table(table_data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
    ]))
    
    elements.append(t)
    doc.build(elements)
    
    return output_path
