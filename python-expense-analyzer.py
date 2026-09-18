expenses=[
    {'category': 'Food', 'amount': 150.75, 'date': '2024-06-01'},
    {'category': 'Transportation', 'amount': 60.00, 'date': '2024-06-02'},
    {'category': 'Entertainment', 'amount': 120.50, 'date': '2024-06-03'},
    {'category': 'Utilities', 'amount': 200.00, 'date': '2024-06-04'},
    {'category': 'Healthcare', 'amount': 80.25, 'date': '2024-06-05'},
]
total =0
for expense in expenses:
    total += expense['amount']
print('Total expenses: $', total)