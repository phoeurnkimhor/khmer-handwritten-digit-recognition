import itertools

def scale_coordinates(nested_coords):
    flat = list(itertools.chain(*nested_coords))
    x_vals = flat[::2]
    y_vals = flat[1::2]


    min_x, max_x = min(x_vals), max(x_vals)
    min_y, max_y = min(y_vals), max(y_vals)
    x_range = max_x - min_x or 1
    y_range = max_y - min_y or 1


    norm_x = [round((x - min_x) / x_range, 8) for x in x_vals]
    norm_y = [round((y - min_y) / y_range, 8) for y in y_vals]
    normalized_flat = list(itertools.chain(*zip(norm_x, norm_y)))

    normalized_data = []
  
    while len(normalized_flat) >= 16:
        normalized_data.append(normalized_flat[:16])
        normalized_flat = normalized_flat[16:]
 
    if normalized_flat:
        normalized_flat.extend([0] * (16 - len(normalized_flat)))
        normalized_data.append(normalized_flat)
    return normalized_data