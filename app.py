# flask app that opens a .csv which represents a literature review and presents it in a slideshow-type webpage
# the .csv is a list of papers, with columns for title and other properties

# FUTURE: https://pypi.org/project/scholarly/
# https://github.com/studio-ousia/luke

from flask import Flask, render_template, request, redirect, url_for, send_from_directory
import pandas as pd
import os
import importlib

app = Flask(__name__)

# find all review directories in reviews folder
reviews = {
    f: pd.read_csv(f'reviews/{f}/key.csv') for f in os.listdir('reviews') if os.path.isdir(os.path.join('reviews', f))
}


review_funcs = {
    f: importlib.import_module(f'reviews.{f}.key') for f in reviews.keys()
}

print(review_funcs)


for r in reviews:
    # replace whitespace with underscores in column names
    reviews[r].columns = [c.replace(' ', '_') for c in reviews[r].columns]
    # replace nan with empty string
    reviews[r].fillna(0, inplace=True)
    # apply dtypes
    for c in review_funcs[r].DTYPES:
        reviews[r][c] = reviews[r][c].astype(review_funcs[r].DTYPES[c])


@app.route('/')
def index():
    # render pres with a list of reviews
    return render_template('pres.html', title="Available Reviews", props={r: (f"<a href='{r}/0'>{r}</a>", False) for r in reviews}, editProp=edit_prop)


@app.route('/<string:review>')
@app.route('/<string:review>/')
def default_paper(review):
    return redirect(f'/{review}/0')


@app.route('/<string:review>/<int:idx>/<string:prop>', methods=['POST'])
def edit_prop(review, prop, idx):
    # edit a property of a paper
    reviews[review].at[idx, prop] = request.form['value']

    return "Success"


@app.route('/<string:review>/save', methods=['POST'])
def save(review):
    # save a particular review
    reviews[review].to_csv(f'reviews/{review}/key.csv', index=False)

    return "Success"


@app.route('/<string:review>/-<path:text>')
def neg(review, text):
    # redirect to the last paper
    return redirect(f'/{review}/{len(reviews[review])-1}')


@app.route('/<string:review>/<int:idx>')
def paper(review, idx):
    df = reviews[review]

    if idx > len(df) - 1:
        return redirect(f'/{review}/0')

    title = f"Paper {idx}: {df.iloc[idx]['Title']}"

    props = {
        col: (
            # value
            review_funcs[review].PREPROCESS[col](df.iloc[idx][col]) if col in review_funcs[review].PREPROCESS else df.iloc[idx][col],
            # inherent properties
            review_funcs[review].PROPS[col] if col in review_funcs[review].PROPS else review_funcs[review].PROPS['DEFAULT']
        ) for col in df.columns if col not in {'Title'}
    }

    # if assets folder doesn't exist, make it
    if not os.path.exists(f'reviews/{review}/assets/{idx}'):
        os.makedirs(f'reviews/{review}/assets/{idx}')

    # add props for each file in review's assets folder for idx
    for f in os.listdir(f'reviews/{review}/assets/{idx}'):
        # if file is image, add as image tag
        if f.split('.')[-1] in {'png', 'jpg', 'jpeg', 'gif'}:
            props[f] = (f"<img src='/{review}/{idx}/{f}' class='figure' />", False)
        # otherwise, add as text
        else:
            with open(f'reviews/{review}/assets/{idx}/{f}', 'r') as file:
                props[f] = (file.read(), False)

    return render_template('pres.html', title=title, props=props, editProp=edit_prop)

@app.route('/<string:review>/<int:idx>/<string:filename>')
def download_file(review, idx, filename):
    return send_from_directory(f'reviews/{review}/assets/{idx}', filename, as_attachment=True)

@app.route('/<string:review>/sortby:<string:query>/<int:idx>')
def sorted_paper(review, query, idx):
    # get index of paper ranked idx by query
    df = reviews[review]
    idx = df.sort_values(query, ascending=False).index[idx]

    return paper(review, idx)

app.run(debug=True)