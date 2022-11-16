# preprocess functions
PREPROCESS = {
    'DOI_URL': lambda x: f'<a href="{x}">{x}</a>',
}

# inherent properties of column
PROPS = {
    'DEFAULT': 'editable',
    'IMAGE': 'figure',
    'DOI_URL': '',
}

# column datatypes
DTYPES = {
    'Year': int,
    #'Teaching_(1-3)': float,
    #'Evaluating_(1-3)': float,
    #'Design_(1-3)': float,
    #'Explainability_(1-3)': float,
}