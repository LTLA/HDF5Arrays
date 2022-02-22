var documenterSearchIndex = {"docs":
[{"location":"#HDF5Arrays-for-Julia","page":"Home","title":"HDF5Arrays for Julia","text":"","category":"section"},{"location":"#Overview","page":"Home","title":"Overview","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This repository ports (parts of) Bioconductor's HDF5Array package to provide a HDF5-backed array abstraction in Julia. Each HDF5Array instance only holds a pointer to the file in memory, and subsets of the data are retrieved on demand. This enables users to manipulate large datasets with minimal memory consumption. We support both dense arrays, represented as HDF5 datasets; and sparse matrices, represented using the 10X Genomics layout.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The HDF5Array class is implemented as a subtype of an AbstractArray and can (in theory) be used interchangeably with Arrays for any read operations. In practice, this abstraction is best used for mimicking the size and subsetting behavior of a real array. If values are needed, it is usually more efficient to manually extract large blocks of data from the file with extractdense() and extractsparse(), rather than relying on Base.getindex() to follow a sensible access pattern.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Write operations are not supported via the HDF5Array interface.","category":"page"},{"location":"#Quick-start","page":"Home","title":"Quick start","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Users may install this package from the GitHub repository through the usual process on the Pkg REPL:","category":"page"},{"location":"","page":"Home","title":"Home","text":"add https://github.com/LTLA/HDF5Arrays.jl","category":"page"},{"location":"","page":"Home","title":"Home","text":"And then:","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> using HDF5Arrays\n\njulia> temp = tempname();\n\njulia> exampledense(temp, \"foo\", (50, 100));\n\njulia> x = DenseHDF5Array(temp, \"foo\");\n\njulia> size(x)\n(50, 100)\n\njulia> y = Array(x);\n\njulia> typeof(y)\nMatrix{Float64} (alias for Array{Float64, 2})\n\njulia> sub = x[1:10,5:20];\n\njulia> size(sub)\n(10, 16)","category":"page"},{"location":"","page":"Home","title":"Home","text":"And the same for sparse matrices:","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> using HDF5Arrays, SparseArrays\n\njulia> temp = tempname();\n\njulia> examplesparse(temp, \"foo\", (50, 100), 0.1);\n\njulia> x = SparseHDF5Matrix(temp, \"foo\");\n\njulia> size(x)\n(50, 100)\n\njulia> y = SparseArrays.sparse(x);\n\njulia> typeof(y)\nSparseArrays.SparseMatrixCSC{Float64, Int64}\n\njulia> sub = x[1:10,5:20];\n\njulia> size(sub)\n(10, 16)","category":"page"},{"location":"#The-HDF5Array-class","page":"Home","title":"The HDF5Array class","text":"","category":"section"},{"location":"#Class-definition","page":"Home","title":"Class definition","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"HDF5Array","category":"page"},{"location":"#HDF5Arrays.HDF5Array","page":"Home","title":"HDF5Arrays.HDF5Array","text":"The HDF5Array is an abstract type that describes the concept of a HDF5-backed array abstraction. In other words, data is stored inside a HDF5 file and is retrieved on demand rather than being loaded into memory. T is the type of the data while N is the dimensionality.\n\nConcrete subtypes include the DenseHDF5Array and the SparseHDF5Matrix. Subtypes are expected to implement the extractdense and extractsparse methods. They may also override the SparseArrays.issparse method to indicate whether they contain sparse data.\n\nWe provide conversion functions to quickly create in-memory Arrays or SparseMatrixCSC objects from any HDF5Arrays. In addition, subsetting operations will automatically views on the original array rather than immediately loading data from file. This enables lazy evaluation for memory-efficient operations on a subset of the dataset.\n\nCurrently, all HDF5Arrays are read-only; calling setindex! will fail.\n\n\n\n\n\n","category":"type"},{"location":"#Subsetting","page":"Home","title":"Subsetting","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"getindex(x::HDF5Array{T,N}, I...) where {T,N}","category":"page"},{"location":"#Base.getindex-Union{Tuple{N}, Tuple{T}, Tuple{HDF5Array{T, N}, Vararg{Any}}} where {T, N}","page":"Home","title":"Base.getindex","text":"getindex(x::HDF5Array{T,N}, I...)\n\nCreate a view into a HDF5Array{T,N} at the indices I. This does not read any data from file, only acting as a delayed subsetting operation.\n\nThis view-returning behavior continues when x is already a view on a HDF5Array. In that case, a new view is returned containing recomputed indices based on I and the parentindices(x).\n\nCalling extractdense or extractsparse on this view will use the indices to extract the desired subset.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> exampledense(tmp, \"stuff\", (20, 10))\n\njulia> x = DenseHDF5Array(tmp, \"stuff\");\n\njulia> y = x[1:5, :];\n\njulia> isa(y, SubArray)\ntrue\n\njulia> z = y[1:2,1:5];\n\njulia> isa(z, SubArray)\ntrue\n\n\n\n\n\n","category":"method"},{"location":"#Extraction","page":"Home","title":"Extraction","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"extractdense(x::SubArray{T,N,P,I,L}, indices...; blockdim = nothing) where {T,N,P<:HDF5Array{T,N},I,L}","category":"page"},{"location":"#HDF5Arrays.extractdense-Union{Tuple{L}, Tuple{I}, Tuple{P}, Tuple{N}, Tuple{T}, Tuple{SubArray{T, N, P, I, L}, Vararg{Any}}} where {T, N, P<:HDF5Array{T, N}, I, L}","page":"Home","title":"HDF5Arrays.extractdense","text":"extractdense(x::SubArray{T,N,P<:HDF5Array{T,N},I,L}, indices...; blockdim = nothing)\n\nExtract an in-memory dense Array from a SubArray x of a parent HDF5Array. The returned matrix contains the same values as x[indices...], in addition to any subsetting used to create the view on the parent.\n\nblockdim is forwarded to the method for the parent HDF5Array.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> exampledense(tmp, \"stuff\", (20, 10))\n\njulia> x = DenseHDF5Array(tmp, \"stuff\");\n\njulia> y = x[2:10, [2,3,5,9,10]];\n\njulia> z = extractdense(y, :, :);\n\njulia> size(z)\n(9, 5)\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"extractsparse(x::SubArray{T,2,P,I,L}, i, j; blockdim = nothing) where {T,P<:HDF5Array{T,2},I,L}","category":"page"},{"location":"#HDF5Arrays.extractsparse-Union{Tuple{L}, Tuple{I}, Tuple{P}, Tuple{T}, Tuple{SubArray{T, 2, P, I, L}, Any, Any}} where {T, P<:HDF5Array{T, 2}, I, L}","page":"Home","title":"HDF5Arrays.extractsparse","text":"extractsparse(x::SubArray{T,N,P<:HDF5Array{T,N},I,L}, i, j; blockdim = nothing)\n\nExtract a sparse matrix from a SubArray x of a parent HDF5Array. The returned matrix contains the same values as x[i, j], in addition to any subsetting used to create the view on the parent.\n\nblockdim is forwarded to the method for the parent HDF5Array.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> examplesparse(tmp, \"stuff\", (20, 10), 0.1)\n\njulia> x = SparseHDF5Matrix(tmp, \"stuff\");\n\njulia> y = x[2:10, [2,3,5,9,10]];\n\njulia> z = extractsparse(y, :, :);\n\njulia> size(z)\n(9, 5)\n\n\n\n\n\n","category":"method"},{"location":"#Conversions","page":"Home","title":"Conversions","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Array{T,N}(x::HDF5Array{T,N}) where {T,N}","category":"page"},{"location":"#Core.Array-Union{Tuple{HDF5Array{T, N}}, Tuple{N}, Tuple{T}} where {T, N}","page":"Home","title":"Core.Array","text":"Array(x::HDF5Array{T,N}})\n\nConvert a HDF5Array into an in-memory Array of the same data type and dimension. This is equivalent to using extractdense while requesting the full extent of each dimension.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> exampledense(tmp, \"stuff\", (20, 10))\n\njulia> x = DenseHDF5Array(tmp, \"stuff\");\n\njulia> y = Array(x);\n\njulia> size(y)\n(20, 10)\n\n\n\n\n\nArray(x::SubArray{T,N,P<:HDF5Array{T,N},I,L})\n\nConvert a view of a HDF5Array into an in-memory Array of the same type and dimension. This is equivalent to using extractdense while requesting the full extent of each dimension.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> exampledense(tmp, \"stuff\", (20, 10))\n\njulia> x = DenseHDF5Array(tmp, \"stuff\");\n\njulia> y = Array(x[1:10,2:5]);\n\njulia> size(y)\n(10, 4)\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"SparseArrays.sparse(x::HDF5Array{T,2}) where {T<:Number}","category":"page"},{"location":"#SparseArrays.sparse-Union{Tuple{HDF5Array{T, 2}}, Tuple{T}} where T<:Number","page":"Home","title":"SparseArrays.sparse","text":"sparse(x::HDF5Array{T,N})\n\nConvert a 2-dimensional HDF5Array into an in-memory sparse matrix of the same data type and dimension, assuming that T is some numeric or boolean type. This is equivalent to using extractsparse while requesting the full extent of each dimension. Note that this only makes sense if x contains a high proportion of zeros.\n\nExamples\n\njulia> using HDF5Arrays, SparseArrays\n\njulia> tmp = tempname();\n\njulia> examplesparse(tmp, \"stuff\", (20, 10), 0.2)\n\njulia> x = SparseHDF5Matrix(tmp, \"stuff\");\n\njulia> y = sparse(x);\n\njulia> typeof(y)\nSparseMatrixCSC{Float64, Int64}\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"SparseArrays.sparse(x::SubArray{T,2,P,I,L}) where {T,P<:HDF5Array{T,2},I,L}","category":"page"},{"location":"#SparseArrays.sparse-Union{Tuple{SubArray{T, 2, P, I, L}}, Tuple{L}, Tuple{I}, Tuple{P}, Tuple{T}} where {T, P<:HDF5Array{T, 2}, I, L}","page":"Home","title":"SparseArrays.sparse","text":"sparse(x::SubArray{T,2,P<:HDF5Array{T,2},I,L})\n\nConvert a view of a 2-dimensional HDF5Array into an in-memory sparse matrix of the same type and dimension. This is equivalent to using extractsparse while requesting the full extent of each dimension.\n\nExamples\n\njulia> using HDF5Arrays, SparseArrays\n\njulia> tmp = tempname();\n\njulia> examplesparse(tmp, \"stuff\", (20, 10), 0.2)\n\njulia> x = SparseHDF5Matrix(tmp, \"stuff\");\n\njulia> y = sparse(x[1:10,2:5]);\n\njulia> typeof(y)\nSparseMatrixCSC{Float64, Int64}\n\n\n\n\n\n","category":"method"},{"location":"#Other-methods","page":"Home","title":"Other methods","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"setindex!(x::HDF5Array{T,N}, v, I::Vararg{Integer,N}) where {T,N}","category":"page"},{"location":"#Base.setindex!-Union{Tuple{N}, Tuple{T}, Tuple{HDF5Array{T, N}, Any, Vararg{Integer, N}}} where {T, N}","page":"Home","title":"Base.setindex!","text":"setindex!(x::HDF5Array{T,N}, v, I::Vararg{Integer,N})\n\nAll HDF5Arrays are strictly read-only, so any attempt to call this function will throw an error.\n\n\n\n\n\n","category":"method"},{"location":"#The-DenseHDF5Array-class","page":"Home","title":"The DenseHDF5Array class","text":"","category":"section"},{"location":"#Class-definition-2","page":"Home","title":"Class definition","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"DenseHDF5Array","category":"page"},{"location":"#HDF5Arrays.DenseHDF5Array","page":"Home","title":"HDF5Arrays.DenseHDF5Array","text":"This class implements a AbstractArray wrapper around a HDF5 dataset. Instances of this class can be used to represent a HDF5 dataset inside collections that expect an AbstractArray. Most importantly, this class does not load any data into memory on construction (and only minimal loading in its show() method). This allows users to manipulate arbitrarily large datasets in low-memory environments. \n\nThe DenseHDF5Array is structurally dense, reflecting the fact that a HDF5 dataset explicitly stores all values (zero or otherwise). T can be any type though this is usually numeric, and occasionally boolean. Any number of dimensions is supported, but note that the dimensions are permuted in Julia; the first dimension is the fastest changing in Julia but is the slowest changing in HDF5.\n\nIt is also possible to perform calculations on this class, in which case values are retrieved from file on demand. While memory-efficient, this approach is likely to be very slow, as it involves multiple (often redundant) I/O calls to the disk. We recommend using this class as a placeholder for a real array in code that does not require the actual values. Once values are explicitly needed, the entire array can be loaded into memory with extractdense or extractsparse.\n\n\n\n\n\n","category":"type"},{"location":"#Constructor","page":"Home","title":"Constructor","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"DenseHDF5Array(file::String, name::String)","category":"page"},{"location":"#HDF5Arrays.DenseHDF5Array-Tuple{String, String}","page":"Home","title":"HDF5Arrays.DenseHDF5Array","text":"HDF5Array(file, name)\n\nCreate a HDF5Array for a dense dataset inside a HDF5 file file at name name. No values are loaded into memory by the constructor (though showing the matrix may load a few values for display).\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> exampledense(tmp, \"stuff\", (20, 10))\n\njulia> x = DenseHDF5Array(tmp, \"stuff\");\n\njulia> size(x)\n(20, 10)\n\njulia> using SparseArrays\n\njulia> SparseArrays.issparse(x)\nfalse\n\n\n\n\n\n","category":"method"},{"location":"#Basic-methods","page":"Home","title":"Basic methods","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"size(x::DenseHDF5Array{T,N}) where {T,N}","category":"page"},{"location":"#Base.size-Union{Tuple{DenseHDF5Array{T, N}}, Tuple{N}, Tuple{T}} where {T, N}","page":"Home","title":"Base.size","text":"size(x::DenseHDF5Array{T,N})\n\nGet the size of a DenseHDF5Array{T,N} as a N-tuple.\n\n\n\n\n\nsize(x::SparseHDF5Matrix{Tv,Ti})\n\nGet the size of a DenseHDF5Array{T,N} as a N-tuple.\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"getindex(x::DenseHDF5Array{T,N}, I::Vararg{Integer,N}) where {T,N}","category":"page"},{"location":"#Base.getindex-Union{Tuple{N}, Tuple{T}, Tuple{DenseHDF5Array{T, N}, Vararg{Integer, N}}} where {T, N}","page":"Home","title":"Base.getindex","text":"getindex(x::DenseHDF5Array{T,N}, I::Vararg{Integer,N})\n\nGet the value of a DenseHDF5Array{T,N} at the position specified by indices I. It would be unwise to use this function for anything other than show() -  we suggest using extractdense to obtain larger blocks of data.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> exampledense(tmp, \"stuff\", (20, 10))\n\njulia> x = DenseHDF5Array(tmp, \"stuff\");\n\njulia> typeof(getindex(x, 1, 1)) \nFloat64\n\n\n\n\n\n","category":"method"},{"location":"#Extraction-2","page":"Home","title":"Extraction","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"extractdense(x::DenseHDF5Array{T,N}, I...; blockdim = nothing) where {T,N}","category":"page"},{"location":"#HDF5Arrays.extractdense-Union{Tuple{N}, Tuple{T}, Tuple{DenseHDF5Array{T, N}, Vararg{Any}}} where {T, N}","page":"Home","title":"HDF5Arrays.extractdense","text":"extractdense(x::DenseHDF5Array{T,N}, I...; blockdim = nothing)\n\nExtract an in-memory dense Array from a DenseHDF5Array.  The returned array contains the same values as x[I...].\n\nFor arbitrary indices, this function performs block-by-block extraction to reduce memory usage. The size of each block is determined by blockdim, which should be a tuple of length equal to the number of dimensions. If blockdim is not specified, the chunk dimensions are used instead; if the dataset is stored in a contiguous layout, arbitrary block dimensions are used.\n\nSome optimization is applied if I only consists of AbstractRange{Int} values.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> exampledense(tmp, \"stuff\", (20, 10))\n\njulia> x = DenseHDF5Array(tmp, \"stuff\");\n\njulia> y = extractdense(x, 1:5, 1:5);\n\njulia> size(y)\n(5, 5)\n\njulia> y2 = extractdense(x, [1,3,5,7], [2,4,6,8,10]);\n\njulia> size(y2)\n(4, 5)\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"extractsparse(x::DenseHDF5Array{T,2}, i, j; blockdim = nothing) where {T<:Union{Number,Bool}}","category":"page"},{"location":"#HDF5Arrays.extractsparse-Union{Tuple{T}, Tuple{DenseHDF5Array{T, 2}, Any, Any}} where T<:Number","page":"Home","title":"HDF5Arrays.extractsparse","text":"extractsparse(x::DenseHDF5Array{T,N}, i, j; blockdim = nothing)\n\nExtract an in-memory sparse matrix from a 2-dimensional DenseHDF5Array.  The returned matrix contains the same values as x[i, j]. This assumes that the type is either numeric or boolean,  and is only useful when there is a high proportion of zero values in x.\n\nFor arbitrary indices, this function performs block-by-block extraction to reduce memory usage. The size of each block is determined by blockdim, which should be a tuple of length equal to the number of dimensions. If blockdim is not specified, the chunk dimensions are used instead; if the dataset is stored in a contiguous layout, arbitrary block dimensions are used.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> exampledense(tmp, \"stuff\", (20, 10); density = 0.2)\n\njulia> x = DenseHDF5Array(tmp, \"stuff\");\n\njulia> y = extractsparse(x, 1:5, 1:5);\n\njulia> typeof(y)\nSparseArrays.SparseMatrixCSC{Float64, Int64}\n\n\n\n\n\n","category":"method"},{"location":"#The-SparseHDF5Matrix-class","page":"Home","title":"The SparseHDF5Matrix class","text":"","category":"section"},{"location":"#Class-definition-3","page":"Home","title":"Class definition","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"SparseHDF5Matrix","category":"page"},{"location":"#HDF5Arrays.SparseHDF5Matrix","page":"Home","title":"HDF5Arrays.SparseHDF5Matrix","text":"This class implements a AbstractArray wrapper around a sparse matrix in a HDF5 file. Instances of this class can be used to represent a HDF5 dataset inside collections that expect an AbstractArray. Most importantly, this class does not load any data into memory on construction (and only minimal loading in its show() method). This allows users to manipulate arbitrarily large datasets in low-memory environments. \n\nHDF5 does not actually implement a native sparse format (at least, not of time of writing). Instead, we expect the 10X Genomics format where the matrix contents are stored in a group containing:\n\nshape, an integer dataset of length 2 containing the number of rows and columns in the matrix.\ndata, a numeric dataset containing all of the non-zero elements in compressed sparse column (CSC) order.\nindices, an integer dataset containing the 0-based row indices of all non-zero elements in CSC order.\nindptr, an integer dataset containing the 0-based pointers into indices for the start and end of each column.\n\nAs with the DenseHDF5Array, we recommend using instances of this class as a placeholder for a real matrix, rather than computing directly on it. Once values are explicitly needed, the entire array can be loaded into memory with extractsparse.\n\n\n\n\n\n","category":"type"},{"location":"#Constructor-2","page":"Home","title":"Constructor","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"SparseHDF5Matrix(file::String, name::String)","category":"page"},{"location":"#HDF5Arrays.SparseHDF5Matrix-Tuple{String, String}","page":"Home","title":"HDF5Arrays.SparseHDF5Matrix","text":"SparseHDF5Matrix(file, name)\n\nCreate a HDF5Array for a sparse matrix inside a HDF5 file file at group name. The group is expected to follow the 10X Genomics format, see SparseHDF5Matrix for more details.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> examplesparse(tmp, \"stuff\", (20, 10), 0.2)\n\njulia> x = SparseHDF5Matrix(tmp, \"stuff\");\n\njulia> size(x)\n(20, 10)\n\njulia> using SparseArrays\n\njulia> SparseArrays.issparse(x)\ntrue\n\n\n\n\n\n","category":"method"},{"location":"#Basic-methods-2","page":"Home","title":"Basic methods","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"size(x::SparseHDF5Matrix{Tv,Ti}) where {Tv,Ti}","category":"page"},{"location":"#Base.size-Union{Tuple{SparseHDF5Matrix{Tv, Ti}}, Tuple{Ti}, Tuple{Tv}} where {Tv, Ti}","page":"Home","title":"Base.size","text":"size(x::DenseHDF5Array{T,N})\n\nGet the size of a DenseHDF5Array{T,N} as a N-tuple.\n\n\n\n\n\nsize(x::SparseHDF5Matrix{Tv,Ti})\n\nGet the size of a DenseHDF5Array{T,N} as a N-tuple.\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"getindex(x::SparseHDF5Matrix{Tv,Ti}, i::Integer, j::Integer) where {Tv,Ti}","category":"page"},{"location":"#Base.getindex-Union{Tuple{Ti}, Tuple{Tv}, Tuple{SparseHDF5Matrix{Tv, Ti}, Integer, Integer}} where {Tv, Ti}","page":"Home","title":"Base.getindex","text":"getindex(x::SparseHDF5Matrix{Tv,Ti}, i, j)\n\nGet the value of x[i,j]. It would be unwise to use this function for anything other than show() -  we suggest using extractsparse to obtain larger blocks of data.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> examplesparse(tmp, \"stuff\", (20, 10), 0.2)\n\njulia> x = SparseHDF5Matrix(tmp, \"stuff\");\n\njulia> typeof(getindex(x, 1, 1))\nFloat64\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"SparseArrays.issparse(x::SparseHDF5Matrix{Tv, Ti}) where {Tv, Ti}","category":"page"},{"location":"#SparseArrays.issparse-Union{Tuple{SparseHDF5Matrix{Tv, Ti}}, Tuple{Ti}, Tuple{Tv}} where {Tv, Ti}","page":"Home","title":"SparseArrays.issparse","text":"issparse(x::SparseHDF5Matrix{Tv,Ti})\n\nReturns true.\n\n\n\n\n\n","category":"method"},{"location":"#Extraction-3","page":"Home","title":"Extraction","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"extractdense(x::SparseHDF5Matrix{Tv,Ti}, i, j; blockdim = nothing) where {Tv,Ti}","category":"page"},{"location":"#HDF5Arrays.extractdense-Union{Tuple{Ti}, Tuple{Tv}, Tuple{SparseHDF5Matrix{Tv, Ti}, Any, Any}} where {Tv, Ti}","page":"Home","title":"HDF5Arrays.extractdense","text":"extractdense(x::SparseHDF5Matrix{Tv,Ti}, i, j; blockdim = nothing)\n\nExtract an in-memory dense Matrix from a SparseHDF5Matrix.  The returned matrix contains the same values as x[i, j].\n\nblockdim is currently ignored and is only provided for consistency with the method for DenseHDF5Arrays.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> examplesparse(tmp, \"stuff\", (20, 10), 0.2)\n\njulia> x = SparseHDF5Matrix(tmp, \"stuff\");\n\njulia> y = extractdense(x, 1:5, [2,3,6,7]);\n\njulia> size(y)\n(5, 4)\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"extractsparse(x::SparseHDF5Matrix{Tv,Ti}, i, j; blockdim = nothing) where {Tv,Ti}","category":"page"},{"location":"#HDF5Arrays.extractsparse-Union{Tuple{Ti}, Tuple{Tv}, Tuple{SparseHDF5Matrix{Tv, Ti}, Any, Any}} where {Tv, Ti}","page":"Home","title":"HDF5Arrays.extractsparse","text":"extractsparse(x::SparseHDF5Matrix{Tv,Ti}, i, j; blockdim = nothing)\n\nExtract an in-memory sparse matrix from a SparseHDF5Matrix x. The returned matrix contains the same values as x[i, j].\n\nblockdim is currently ignored and is only provided for consistency with the method for DenseHDF5Arrays.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> examplesparse(tmp, \"stuff\", (20, 10), 0.2)\n\njulia> x = SparseHDF5Matrix(tmp, \"stuff\");\n\njulia> y = extractsparse(x, 1:5, [2,3,6,7]);\n\njulia> size(y)\n(5, 4)\n\n\n\n\n\n","category":"method"},{"location":"#Miscellaneous","page":"Home","title":"Miscellaneous","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"exampledense(x, name::String, dims::Tuple{Integer,Integer})","category":"page"},{"location":"#HDF5Arrays.exampledense-Tuple{Any, String, Tuple{Integer, Integer}}","page":"Home","title":"HDF5Arrays.exampledense","text":"exampledense(x, name, dims; density = 1, compress = 6, chunkdim = nothing)\n\nCreate an example dense dataset with name inside a HDF5 file/group. x may be either a string containing the name of a new HDF5 file, or a handle into an existing HDf5 file or group. dims should be a tuple specifying the dimensions of the dataset.\n\nThe HDF5 dataset is created with random double-precision values at the specified density. Lowering the density will introduce zero values randomly into the dataset. Note that this setting does not affect the structural density of the dataset.\n\ncompress specifies the DEFLATE compression level - if set to zero, no compression is used. chunkdim should be a tuple of length equal to dims, specifying the chunk dimensions to be used for compression. This is heuristically determined if not supplied, and is ignored if compress = 0.\n\nNothing is returned by this function.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> exampledense(tmp, \"stuff\", (10, 5, 2))\n\njulia> y = DenseHDF5Array(tmp, \"stuff\");\n\njulia> size(y)\n(10, 5, 2)\n\n\n\n\n\n","category":"method"},{"location":"","page":"Home","title":"Home","text":"examplesparse(x, name::String, dims::Tuple{Integer,Integer}, density::Float64)","category":"page"},{"location":"#HDF5Arrays.examplesparse-Tuple{Any, String, Tuple{Integer, Integer}, Float64}","page":"Home","title":"HDF5Arrays.examplesparse","text":"examplesparse(x, name, dims, density; compress = 6, chunkdim = 10000)\n\nCreate an example sparse dataset with name inside a HDF5 file/group. x may be either a string containing the name of a new HDF5 file, or a handle into an existing HDf5 file or group. dims should be a tuple specifying the dimensions of the dataset.\n\nThe sparse matrix is created with random double-precision values at the specified density. Contents are written to file inside group name in the 10X Genomics format, which uses the compressed sparse column layout. Briefly: values are stored in data, row indices in indices, column pointers in indptr and the dimensions in shape.\n\ncompress specifies the DEFLATE compression level - if set to zero, no compression is used. chunkdim should be a tuple of length equal to dims, specifying the chunk dimensions to be used for compression. This is heuristically determined if not supplied, and is ignored if compress = 0.\n\nNothing is returned by this function.\n\nExamples\n\njulia> using HDF5Arrays\n\njulia> tmp = tempname();\n\njulia> examplesparse(tmp, \"stuff\", (10, 20), 0.1)\n\njulia> y = SparseHDF5Matrix(tmp, \"stuff\");\n\njulia> size(y)\n(10, 20)\n\n\n\n\n\n","category":"method"},{"location":"#Contact","page":"Home","title":"Contact","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This package is maintained by Aaron Lun (@LTLA). If you have bug reports or feature requests, please post them as issues at the GitHub repository.","category":"page"}]
}
