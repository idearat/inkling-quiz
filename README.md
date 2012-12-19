# Web Application Engineer Challenge

The Challenge Specifically States:

Without using any external libraries, create a 2D "Path" constructor 
that accepts either an array of points (which are arrays of length two) or
a subset of an SVG path string (see http://www.w3.org/TR/SVG/paths.html),
where only the moveto, closepath and lineto commands are accepted.

The path must be connected, so the moveto command must only appear at the
beginning and the closepath may optionally appear only at the end. The
lineto must accept both absolute and relative integer coordinates.

The Path objects must inherit from Arrays, so all array methods should
work on Path objects. This means that new Path instanceof Path and new
Path instanceof Array must both return true.

A Path object must have a clone method that returns a new Path with the
same points and a toString method that returns an SVG path string
representing the Path. Additionally, the methods map, filter, and slice
must return Path objects rather than pure arrays.

This implementation only needs to function in the latest versions of
Firefox and Safari.

# Operation

Opening the file index.html in either Firefox or Safari will run a series
of unit tests which exercise the solution code. The solution has also been
tested in recent versions of Chrome and IE9.

# Files

index.html          A test page which will load and run unit tests which
                    ensure the code conforms to the above specification.

inkling.css         CSS instructions specific to the simple test harness.

inkling\_base.js    The actual solution JavaScript. This file contains a
                    Path type implemented to meet the specifications.

inkling\_test.js    A simplified test harness and unit tests which exercise
                    the Path type.

README.md           This file :)

