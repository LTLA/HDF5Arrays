export exampledense
import HDF5

"""
    exampledense(x, name, dims; density = 1, compress = 6, chunkdim = nothing)

Create an example dense dataset with `name` inside a HDF5 file/group.
`x` may be either a string containing the name of a new HDF5 file, or a handle into an existing HDf5 file or group.
`dims` should be a tuple specifying the dimensions of the dataset.

The HDF5 dataset is created with random double-precision values at the specified `density`.
Lowering the `density` will introduce zero values randomly into the dataset.
Note that this setting does not affect the structural density of the dataset.

`compress` specifies the DEFLATE compression level - if set to zero, no compression is used.
`chunkdim` should be a tuple of length equal to `dims`, specifying the chunk dimensions to be used for compression.
This is heuristically determined if not supplied, and is ignored if `compress = 0`.

Nothing is returned by this function.

# Examples
```jldoctest
julia> using HDF5Arrays

julia> tmp = tempname();

julia> exampledense(tmp, "stuff", (10, 5, 2))

julia> y = DenseHDF5Array(tmp, "stuff");

julia> size(y)
(10, 5, 2)
```
"""
function exampledense(x, name::String, dims::Tuple{Vararg{Integer}}; density = 1, compress = 6, chunkdim = nothing)
    val = Array{Float64,length(dims)}(undef, dims)
    for i in 1:length(val)
        if rand() <= density
            val[i] = rand()
        else
            val[i] = 0
        end
    end

    if compress > 0
        if chunkdim == nothing
            x[name,compress=compress] = val
        else
            x[name,compress=compress,chunk=chunkdim] = val
        end
    else
        x[name] = val
    end

    return
end

function exampledense(x::String, name::String, dims::Tuple{Vararg{Integer}}; density = 1, compress = 6, chunkdim = nothing)
    handle = HDF5.h5open(x, "w");
    exampledense(handle, name, dims; density = density, compress = compress, chunkdim = chunkdim)
    return
end
