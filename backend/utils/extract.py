def extract_coordinates(json_data):
    nested_coords = []
    temp_list = []

    if json_data is not None:
        objects = json_data.get("objects", [])
        for obj in objects:
            if obj.get("type") == "path" and "path" in obj:
                for point in obj["path"]:
                    if isinstance(point, list):
                        cmd = point[0]
                        coords = point[1:]
                        for i in range(0, len(coords), 2):
                            if i + 1 < len(coords):
                                x, y = coords[i], coords[i + 1]
                                if isinstance(x, (int, float)) and isinstance(y, (int, float)):
                                    temp_list.extend([x, y])
        while len(temp_list) >= 16:
            nested_coords.append(temp_list[:16])
            temp_list = temp_list[16:]
        if temp_list:
            nested_coords.append(temp_list)
    return nested_coords